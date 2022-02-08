import { nanoid } from "nanoid";
import { Request, NextFunction } from "express";
import {
  CachedResponse,
  Chunk,
  ExtendedResponse,
  Options,
  PurgeFunction
} from "./types";
import { memoryStore } from "./stores/memory.store";
import { cacheChunk, sealChunks, purgeChunksAfterResponses } from "./chunk";
import { Queue } from "./utils";
import { defaultGetCacheKey } from "./cache-key";
import { defaultOnCacheHit, defaultOnCacheMiss } from "./cache-behavior";

const defaultOptions = {
  maxAge: undefined,
  store: memoryStore(),
  getCacheKey: defaultGetCacheKey,
  getCacheTag: undefined,
  onCacheHit: defaultOnCacheHit,
  onCacheMiss: defaultOnCacheMiss
};

export const expressAggressiveCache = (options?: Options) => {
  const {
    debug,
    maxAge: defaultMaxAge,
    store,
    getCacheKey,
    getCacheTag,
    onCacheHit,
    onCacheMiss
  } = {
    ...defaultOptions,
    ...options
  };

  const log = (...msg: any[]) => {
    if (!debug) return;

    // eslint-disable-next-line no-console
    console.log(...msg);
  };

  const responseBucket = store<CachedResponse>();
  const chunkBucket = store<Chunk>();
  const cacheKeyBucket = store<string>();

  const purge: PurgeFunction = async (cacheTag: string) => {
    const cacheKey = await cacheKeyBucket.get(cacheTag);
    if (cacheKey !== undefined) {
      await cacheKeyBucket.del(cacheTag);
      const cachedResponse = await responseBucket.get(cacheKey);
      if (cachedResponse !== undefined) {
        await responseBucket.del(cacheKey);
        purgeChunksAfterResponses(chunkBucket, cachedResponse.chunks);
      }
    }
  };

  const updateCacheKeyBucketOptional = async (
    req: Request,
    res: ExtendedResponse,
    cacheKey: string
  ) => {
    if (getCacheTag) {
      const cacheTag = await getCacheTag({ req, res });
      if (cacheTag !== undefined) {
        await cacheKeyBucket.set(cacheTag, cacheKey);
      }
    }
  };

  const writeChunks = async (
    res: ExtendedResponse,
    cachedResponse: CachedResponse
  ) => {
    for (const chunkId of cachedResponse.chunks) {
      const chunk = await chunkBucket.get(chunkId);
      if (chunk === undefined) throw new Error(`missing chunk: ${chunkId}`);
      res.write(chunk);
    }
  };

  const returnCachedResponse = async (
    req: Request,
    res: ExtendedResponse,
    cachedResponse: CachedResponse
  ) => {
    res.status(cachedResponse.statusCode);
    res.set(cachedResponse.headers);

    await onCacheHit({ req, res });

    await writeChunks(res, cachedResponse);

    res.end();
  };

  const checkAndHandleCacheHit = async (
    cachedResponse: CachedResponse | undefined,
    req: Request,
    res: ExtendedResponse,
    cacheKey: string
  ) => {
    if (cachedResponse?.isSealed) {
      if (await chunkBucket.has(cachedResponse.chunks)) {
        log("HIT:", cacheKey);
        await returnCachedResponse(req, res, cachedResponse);
        return true;
      } else {
        log("chunk missing");
      }
    }
    return false;
  };

  const handleCacheMiss = async (
    req: Request,
    res: ExtendedResponse,
    onFinish: () => void,
    onWrite: (chunk: Chunk | undefined) => void,
    cacheKey: string
  ) => {
    log("MISS - key not found:", cacheKey);
    await onCacheMiss({ req, res });

    const originalWrite: any = res.write;
    const originalEnd: any = res.end;

    res.write = function write(...args: any[]) {
      onWrite(args[0]);
      return originalWrite.call(this, ...args);
    };

    res.end = function end(...args: any[]) {
      onWrite(args[0]);
      return originalEnd.call(this, ...args);
    };

    res.on("finish", onFinish);
  };

  const handleNonGetRequestsAsCacheMiss = async (
    req: Request,
    res: ExtendedResponse
  ) => {
    if (req.method !== "GET") {
      log("MISS - not a GET request");
      await onCacheMiss({ req, res });
      return true;
    }
    return false;
  };

  const getResponseFunctions = (
    req: Request,
    res: ExtendedResponse,
    cacheKey: string
  ) => {
    const requestId = nanoid();
    const chunkQueue = new Queue();

    const onWrite = (chunk: Chunk | undefined) => {
      if (chunk !== undefined) {
        chunkQueue
          .push(() =>
            cacheChunk({
              requestId,
              chunk,
              res,
              cacheKey,
              defaultMaxAge,
              log,
              responseBucket,
              chunkBucket,
              chunkQueue
            })
          )
          .run();
      }
    };

    const onFinish = async () => {
      await updateCacheKeyBucketOptional(req, res, cacheKey);
      chunkQueue
        .push(() =>
          sealChunks({
            requestId,
            cacheKey,
            res,
            log,
            responseBucket
          })
        )
        .run();
    };

    return { onWrite, onFinish };
  };

  return {
    purge,
    middleware: async (
      req: Request,
      res: ExtendedResponse,
      next: NextFunction
    ) => {
      if (await handleNonGetRequestsAsCacheMiss(req, res)) {
        return next();
      }

      const normalizedPath = defaultGetCacheKey({ req });
      const cacheKey = await getCacheKey({ req, res, normalizedPath });

      res.aggressiveCache = {
        chunks: []
      };

      const { onFinish, onWrite } = getResponseFunctions(req, res, cacheKey);

      const cachedResponse = await responseBucket.get(cacheKey);
      if (await checkAndHandleCacheHit(cachedResponse, req, res, cacheKey)) {
        return;
      } else {
        await handleCacheMiss(req, res, onFinish, onWrite, cacheKey);
        next();
      }
    }
  };
};
