import { Router } from "express";
import expressAgressiveCache from "../";
import { sharedRoutes } from "./shared.routes";

export const defaultRouter = Router();
export const cache = expressAgressiveCache();

defaultRouter.use(cache.middleware);
defaultRouter.use(sharedRoutes);
