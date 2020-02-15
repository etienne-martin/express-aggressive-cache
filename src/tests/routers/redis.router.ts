import { Router } from "express";
import Redis from "ioredis";
import { expressAggressiveCache, redisStore } from "../../";

export const redisRouter = Router();

redisRouter.use(
  expressAggressiveCache({
    store: redisStore({
      client: new Redis("//localhost:6379")
    })
  })
);

redisRouter.get("/", (req, res) => {
  res.send("hello world");
});
