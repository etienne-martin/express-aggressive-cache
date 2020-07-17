import express from "express";
import { defaultRouter } from "./default.router";
import { compiledRouter } from "./compiled.router";
import { redisRouter } from "./redis.router";

export { cache as defaultCache } from "./default.router";
export { cache as compiledCache } from "./compiled.router";
export { cache as redisCache } from "./redis.router";

export const app = express();

app.use("/default", defaultRouter);
app.use("/compiled", compiledRouter);
app.use("/redis", redisRouter);
