import { Router } from "express";
import Redis from "ioredis";
import { expressAggressiveCache, redisStore } from "../../";

export const redisRouter = Router();

try {
  redisRouter.use(
    expressAggressiveCache({
      store: redisStore({
        client: new Redis("//localhost:6379")
      })
    })
  );
} catch (err) {
  console.log(err);
}

redisRouter.get("/", (req, res) => {
  res.send("hello world");
});
