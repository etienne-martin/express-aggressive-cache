import express from "express";
import { redisRouter } from "./routers/redis.router";
import { defaultRouter } from "./routers/default.router";

export const app = express();

app.use("/default", defaultRouter);
app.use("/redis", redisRouter);
