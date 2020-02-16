import { expressAggressiveCache } from "./middleware";
import { Options } from "./types";

export { memoryStore } from "./stores/memory.store";
export { redisStore } from "./stores/redis.store";
export { GetCacheKey } from "./types";

export type ExpressAggressiveCacheOptions = Options;
export default expressAggressiveCache;
