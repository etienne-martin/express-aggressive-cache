import { CachedResponse, Chunk, ExtendedResponse, Store } from "./types";
import { parseCacheControl, sha256, Queue } from "./utils";
import { shouldCache } from "./should-cache";
import { getMaxAge } from "./utils/cache-control";

/**
 * Do not store incomplete responses indefinitely
 * clear them after 10s in case something fails
 */
const INCOMPLETE_RESPONSE_TTL = 10;

/**
 * Keep chunks in memory longer than the response itself
 */
const CHUNK_MAX_AGE_EXTENSION = 10;

/**
 * Chunk IDs contains the cache key so that we can have two identical chunks with different expiration
 */
const getChunkId = (cacheKey: string, chunk: Chunk) => {
  return `${cacheKey}:${sha256(chunk)}`;
};

export const sealChunks = async ({
  requestId,
  cacheKey,
  res,
  log,
  responseBucket
}: {
  requestId: string;
  cacheKey: string;
  res: ExtendedResponse;
  log: typeof console.log;
  responseBucket: Store<CachedResponse>;
}) => {
  const chunks = res.aggressiveCache?.chunks;

  if (!chunks?.length) return;

  const cachedResponse = await responseBucket.get(cacheKey);

  if (cachedResponse?.requestId !== requestId) return;

  const headers = { ...res.getHeaders() };
  const statusCode = res.statusCode;

  delete headers["set-cookie"];

  await responseBucket.set(
    cacheKey,
    {
      ...cachedResponse,
      chunks,
      statusCode,
      headers,
      isSealed: true
    },
    cachedResponse.maxAge
  );

  log("SEALED CACHE:", cacheKey);
};

export const cacheChunk = async ({
  requestId,
  chunk,
  res,
  cacheKey,
  defaultMaxAge,
  log,
  responseBucket,
  chunkBucket,
  chunkQueue
}: {
  requestId: string;
  chunk: Chunk;
  res: ExtendedResponse;
  cacheKey: string;
  defaultMaxAge: number | undefined;
  log: typeof console.log;
  responseBucket: Store<CachedResponse>;
  chunkBucket: Store<Chunk>;
  chunkQueue: Queue;
}) => {
  const cacheControlHeader = `${res.getHeader("Cache-Control") || ""}`;
  const cacheControl = parseCacheControl(cacheControlHeader);

  if (!shouldCache(cacheControl)) return;

  const maxAge = getMaxAge(cacheControl, defaultMaxAge);
  const chunkMaxAge = maxAge ? maxAge + CHUNK_MAX_AGE_EXTENSION : undefined;
  const cachedResponse = await responseBucket.get(cacheKey);

  if (!cachedResponse) {
    const chunkId = getChunkId(cacheKey, chunk);

    try {
      await Promise.all([
        responseBucket.set(
          cacheKey,
          {
            requestId,
            chunks: [],
            statusCode: 200,
            headers: {},
            isSealed: false,
            maxAge
          },
          INCOMPLETE_RESPONSE_TTL
        ),
        chunkBucket.set(chunkId, chunk, chunkMaxAge)
      ]);

      res.aggressiveCache?.chunks?.push(chunkId);

      log("CACHED CHUNK (NEW CACHE ENTRY):", cacheKey);
    } catch (err) {
      log(err);
      await chunkQueue.destroy();
    }

    return;
  }

  if (cachedResponse.requestId === requestId) {
    const chunkId = getChunkId(cacheKey, chunk);

    try {
      await chunkBucket.set(chunkId, chunk, chunkMaxAge);

      res.aggressiveCache?.chunks?.push(chunkId);

      log("CACHED CHUNK:", cacheKey);
    } catch (err) {
      log(err);
      await chunkQueue.destroy();
    }

    return;
  }

  log("ALREADY CACHING:", cacheKey);

  await chunkQueue.destroy();
};
