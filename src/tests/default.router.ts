import { Router } from "express";
import expressAggressiveCache from "../";
import { sharedRoutes } from "./shared.routes";
import { akamaiGetCacheTag } from "./akamai-cache-tag";

export const defaultRouter = Router();
export const cache = expressAggressiveCache({ getCacheTag: akamaiGetCacheTag });

defaultRouter.use(cache.middleware);
defaultRouter.use(sharedRoutes);
