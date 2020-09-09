import { Router } from "express";
import expressAggressiveCache from "../../dist"; // <-- Using the compiled version
import { sharedRoutes } from "./shared.routes";
import { akamaiGetCacheTag } from "./akamai-cache-tag";

export const compiledRouter = Router();
export const cache = expressAggressiveCache({ getCacheTag: akamaiGetCacheTag });

compiledRouter.use(cache.middleware);
compiledRouter.use(sharedRoutes);
