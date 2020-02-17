import { Router } from "express";
import Redis from "ioredis";
import cache, { redisStore } from "../";
import { sharedRoutes } from "./shared.routes";

export const redisRouter = Router();

redisRouter.use(
  cache({
    store: redisStore({
      client: new Redis("//localhost:6379")
    })
  })
);

redisRouter.use(sharedRoutes);
