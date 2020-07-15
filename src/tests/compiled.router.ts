import { Router } from "express";
import expressAgressiveCache from "../../dist"; // <-- Using the compiled version
import { sharedRoutes } from "./shared.routes";

export const compiledRouter = Router();
export const cache = expressAgressiveCache();

compiledRouter.use(cache.middleware);
compiledRouter.use(sharedRoutes);
