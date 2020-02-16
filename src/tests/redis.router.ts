import { Router } from "express";
import Redis from "ioredis";
import { expressAggressiveCache, redisStore } from "../index";
import { sharedRoutes } from "./shared.routes";

export const redisRouter = Router();

redisRouter.use(
  expressAggressiveCache({
    store: redisStore({
      client: new Redis("//localhost:6379")
    })
  })
);

redisRouter.use(sharedRoutes);
