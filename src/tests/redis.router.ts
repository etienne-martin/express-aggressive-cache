import { Router } from "express";
import Redis from "ioredis";
import expressAgressiveCache, { redisStore } from "../";
import { sharedRoutes } from "./shared.routes";

export const redisRouter = Router();
export const cache = expressAgressiveCache({
  store: redisStore({
    client: new Redis("//localhost:6379")
  })
});

redisRouter.use(cache.middleware);

redisRouter.use(sharedRoutes);
