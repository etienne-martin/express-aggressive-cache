import express from "express";
import { redisRouter } from "./routers/redis.router";
import { memoryRouter } from "./routers/memory.router";

export const app = express();

app.use("/redis", redisRouter);
app.use("/", memoryRouter);
