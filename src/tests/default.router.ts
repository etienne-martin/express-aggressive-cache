import { Router } from "express";
import expressAggressiveCache from "../";
import { sharedRoutes } from "./shared.routes";

export const defaultRouter = Router();
export const cache = expressAggressiveCache();

defaultRouter.use(cache.middleware);
defaultRouter.use(sharedRoutes);
