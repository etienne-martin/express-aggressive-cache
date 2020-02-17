import { Router } from "express";
import cache from "../../dist"; // <-- Using the compiled version
import { sharedRoutes } from "./shared.routes";

export const compiledRouter = Router();

compiledRouter.use(cache());
compiledRouter.use(sharedRoutes);
