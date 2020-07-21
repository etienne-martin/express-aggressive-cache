import nanoid from "nanoid";
import { Request, NextFunction } from "express";
import {
  CachedResponse,
  Chunk,
  ExtendedResponse,
  Options,
  PurgeFunction
} from "./types";
import { returnCachedResponse } from "./response";
import { memoryStore } from "./stores/memory.store";
import { cacheChunk, sealChunks } from "./chunk";
import { Queue } from "./utils";
import { defaultGetCacheKey } from "./cache-key";

const defaultOptions = {
  maxAge: undefined,
  store: memoryStore(),
  getCacheKey: defaultGetCacheKey
};

export const expressAggressiveCache = (options?: Options) => {
  const { debug, maxAge: defaultMaxAge, store, getCacheKey } = {
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

  const purge: PurgeFunction = async (tag: string) => {
    throw new Error(
      `purge for tag ${tag} not implemented - API could still change - do not use`
    );
  };

  const checkAndHandleCacheHit = async (
    cachedResponse: CachedResponse | undefined,
    res: ExtendedResponse,
    cacheKey: string
  ) => {
    if (cachedResponse?.isSealed) {
      if (await chunkBucket.has(cachedResponse.chunks)) {
        log("HIT:", cacheKey);
        await returnCachedResponse(res, cachedResponse, chunkBucket);
        return true;
      } else {
        log("chunk missing");
      }
    }
    return false;
  };

  const handleCacheMiss = async (
    res: ExtendedResponse,
    onFinish: () => void,
    onWrite: (chunk: Chunk | undefined) => void,
    cacheKey: string
  ) => {
    log("MISS:", cacheKey);
    res.setHeader("X-Cache", "MISS");

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

  const handleNonGetRequestsAsCacheMiss = (
    req: Request,
    res: ExtendedResponse
  ) => {
    if (req.method !== "GET") {
      res.setHeader("X-Cache", "MISS");
      return true;
    }
    return false;
  };

  const getChuckFunctions = (res: ExtendedResponse, cacheKey: string) => {
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

    const onFinish = () => {
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
      if (handleNonGetRequestsAsCacheMiss(req, res)) {
        return next();
      }

      const normalizedUrl = defaultGetCacheKey({ req, res });
      const cacheKey = await getCacheKey({ req, res, normalizedUrl });

      res.aggressiveCache = {
        chunks: []
      };

      const { onFinish, onWrite } = getChuckFunctions(res, cacheKey);

      const cachedResponse = await responseBucket.get(cacheKey);
      if (await checkAndHandleCacheHit(cachedResponse, res, cacheKey)) {
        return;
      } else {
        await handleCacheMiss(res, onFinish, onWrite, cacheKey);
        next();
      }
    }
  };
};
