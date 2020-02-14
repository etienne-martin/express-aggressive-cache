import { CachedResponse, Chunk, Store } from "./types";
import express from "express";
import { parseCacheControl, sha256, Queue } from "./utils";
import { shouldCache } from "./should-cache";

/**
 * Do not store non sealed responses indefinitely
 * clear them after 10s in case something fails
 */
const NON_SEALED_RESPONSE_TTL = 10;

/**
 * Keep chunks in memory longer than the response itself
 */
const CHUNK_MAX_AGE_EXTENSION = 10;

interface Response extends express.Response {
  aggressiveCache?: {
    chunks?: string[];
  };
}

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
  responseBucket
}: {
  requestId: string;
  cacheKey: string;
  res: Response;
  responseBucket: Store<CachedResponse>;
}) => {
  if (!res.aggressiveCache?.chunks?.length) return;

  const cachedResponse = await responseBucket.get(cacheKey);

  if (cachedResponse?.requestId === requestId) {
    await responseBucket.set(
      cacheKey,
      {
        ...cachedResponse,
        chunks: res.aggressiveCache.chunks,
        isSealed: true
      },
      cachedResponse.maxAge
    );

    console.log("SEALED CACHE:", cacheKey);
  }
};

export const cacheChunk = async ({
  requestId,
  chunk,
  res,
  cacheKey,
  defaultMaxAge,
  responseBucket,
  chunkBucket,
  chunkQueue
}: {
  requestId: string;
  chunk: Chunk;
  res: Response;
  cacheKey: string;
  defaultMaxAge: number | undefined;
  responseBucket: Store<CachedResponse>;
  chunkBucket: Store<Chunk>;
  chunkQueue: Queue;
}) => {
  const cacheControl = parseCacheControl(`${res.getHeader("Cache-Control")}`);

  if (!shouldCache(cacheControl)) return;

  const maxAge: number | undefined = cacheControl?.["max-age"] || defaultMaxAge;
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
            statusCode: res.statusCode,
            headers: { ...res.getHeaders() },
            isSealed: false,
            maxAge
          },
          NON_SEALED_RESPONSE_TTL
        ),
        chunkBucket.set(chunkId, chunk, chunkMaxAge)
      ]);

      res.aggressiveCache = {
        chunks: [chunkId]
      };

      console.log("CACHED CHUNK (NEW CACHE ENTRY):", cacheKey);
    } catch (err) {
      console.log(err);
    }

    return;
  }

  if (cachedResponse.requestId === requestId) {
    const chunkId = getChunkId(cacheKey, chunk);

    try {
      await chunkBucket.set(chunkId, chunk, chunkMaxAge);

      res.aggressiveCache?.chunks?.push(chunkId);

      console.log("CACHED CHUNK:", cacheKey);
    } catch (err) {
      console.log(err);
    }

    return;
  }

  console.log("ALREADY CACHING:", cacheKey);

  await chunkQueue.destroy();
};
