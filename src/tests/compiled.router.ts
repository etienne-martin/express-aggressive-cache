import { Router } from "express";
import expressAggressiveCache from "../../dist"; // <-- Using the compiled version
import { sharedRoutes } from "./shared.routes";

export const compiledRouter = Router();
export const cache = expressAggressiveCache();

compiledRouter.use(cache.middleware);
compiledRouter.use(sharedRoutes);
