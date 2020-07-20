import { Router } from "express";
import Redis from "ioredis";
import expressAggressiveCache, { redisStore } from "../";
import { sharedRoutes } from "./shared.routes";
import { akamaiGetCacheTag } from "./akamai-cache-tag";

export const redisRouter = Router();
export const cache = expressAggressiveCache({
  store: redisStore({
    client: new Redis("//localhost:6379")
  }),
  getCacheTag: akamaiGetCacheTag
});

redisRouter.use(cache.middleware);

redisRouter.use(sharedRoutes);
