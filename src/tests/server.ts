import express from "express";
import nanoid from "nanoid";
import { defaultRouter } from "./default.router";
import { compiledRouter } from "./compiled.router";
import { redisRouter } from "./redis.router";

export const app = express();

app.get("/:store/upstream-cookie", (req, res, next) => {
  res.cookie("upstream-cookie-1", nanoid());
  next();
});

app.get("/:store/upstream-cookie-multiple", (req, res, next) => {
  res.cookie("upstream-cookie-1", nanoid());
  res.cookie("upstream-cookie-2", nanoid());
  next();
});

app.get("/:store/upstream-cookie-and-set-cookie", (req, res, next) => {
  res.cookie("upstream-cookie-1", nanoid());
  next();
});

app.use("/default", defaultRouter);
app.use("/compiled", compiledRouter);
app.use("/redis", redisRouter);
