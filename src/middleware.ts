import nanoid from "nanoid";
import { Request, NextFunction } from "express";
import { CachedResponse, Chunk, ExtendedResponse, Options } from "./types";
import { returnCachedResponse } from "./response";
import { memoryStore } from "./stores/memory.store";
import { cacheChunk, sealChunks } from "./chunk";
import { Queue } from "./utils";
import { defaultGetCacheKey } from "./cache-key";
import { normalizeSetCookieHeaders } from "./utils/cookie";

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

  return async (req: Request, res: ExtendedResponse, next: NextFunction) => {
    /**
     * Should only cache GET requests
     */
    if (req.method !== "GET") {
      res.setHeader("X-Cache", "MISS");
      return next();
    }

    const requestId = nanoid();
    const originalWrite: any = res.write;
    const originalEnd: any = res.end;
    const chunkQueue = new Queue();
    const normalizedUrl = defaultGetCacheKey({ req, res });
    const cacheKey = await getCacheKey({ req, res, normalizedUrl });
    const cachedResponse = await responseBucket.get(cacheKey);
    const setCookieHeaders = res.getHeader("set-cookie");

    res.aggressiveCache = {
      chunks: [],
      upstreamCookies: normalizeSetCookieHeaders(setCookieHeaders)
    };

    // ----------- CACHE HIT ----------- //

    if (cachedResponse?.isSealed) {
      if (await chunkBucket.has(cachedResponse.chunks)) {
        log("HIT:", cacheKey);
        await returnCachedResponse(res, cachedResponse, chunkBucket);
        return;
      } else {
        log("Missing chunk!");
      }
    }

    // ----------- CACHE MISS ----------- //

    res.setHeader("X-Cache", "MISS");
    log("MISS:", cacheKey);

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
            log,
            responseBucket
          })
        )
        .run();
    });

    next();
  };
};
