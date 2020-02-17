import { Router } from "express";
import cache from "../";
import { sharedRoutes } from "./shared.routes";

export const defaultRouter = Router();

defaultRouter.use(cache());
defaultRouter.use(sharedRoutes);
