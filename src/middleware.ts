import nanoid from "nanoid";
import { NextFunction, Request, Response } from "express";
import { CachedResponse, Chunk, Options } from "./types";
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
  const { maxAge: defaultMaxAge, store, getCacheKey } = {
    ...defaultOptions,
    ...options
  };

  const responseBucket = store<CachedResponse>();
  const chunkBucket = store<Chunk>();

  return async (req: Request, res: Response, next: NextFunction) => {
    /**
     * Should only cache GET requests
     */
    if (req.method !== "GET") return next();

    const requestId = nanoid();
    const originalWrite: any = res.write;
    const originalEnd: any = res.end;
    const chunkQueue = new Queue();
    const normalizedUrl = defaultGetCacheKey({ req, res });
    const cacheKey = await getCacheKey({ req, res, normalizedUrl });
    const cachedResponse = await responseBucket.get(cacheKey);

    // ----------- CACHE HIT ----------- //

    if (cachedResponse?.isSealed) {
      if (await chunkBucket.has(cachedResponse.chunks)) {
        console.log("HIT:", cacheKey);
        await returnCachedResponse(res, cachedResponse, chunkBucket);
        return;
      } else {
        console.log("Missing chunk!");
      }
    }

    // ----------- CACHE MISS ----------- //

    res.setHeader("X-Cache", "MISS");
    console.log("MISS:", cacheKey);

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
              responseBucket,
              chunkBucket,
              chunkQueue
            })
          )
          .run();
      }
    };

    res.write = function write(...args: any[]) {
      onWrite(args[0]);
      return originalWrite.call(this, ...args);
    };

    res.end = function end(...args: any[]) {
      onWrite(args[0]);
      return originalEnd.call(this, ...args);
    };

    res.on("finish", () => {
      chunkQueue
        .push(() =>
          sealChunks({
            requestId,
            cacheKey,
            res,
            responseBucket
          })
        )
        .run();
    });

    next();
  };
};
