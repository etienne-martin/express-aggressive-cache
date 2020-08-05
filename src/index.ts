import { expressAggressiveCache } from "./middleware";
import { Options } from "./types";

export { memoryStore } from "./stores/memory.store";
export { redisStore } from "./stores/redis.store";
export { GetCacheKey, GetCacheTag, OnCache, PurgeFunction } from "./types";

export type ExpressAggressiveCacheOptions = Options;

export default expressAggressiveCache;
