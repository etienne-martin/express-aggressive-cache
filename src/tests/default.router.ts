import { Router } from "express";
import { expressAggressiveCache } from "../index";
import { sharedRoutes } from "./shared.routes";

export const defaultRouter = Router();

defaultRouter.use(expressAggressiveCache());
defaultRouter.use(sharedRoutes);
