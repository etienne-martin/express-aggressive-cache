import express from "express";
import { redisRouter } from "./redis.router";
import { defaultRouter } from "./default.router";

export const app = express();

app.use("/default", defaultRouter);
app.use("/redis", redisRouter);
