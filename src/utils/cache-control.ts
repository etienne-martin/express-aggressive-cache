import { CacheControl } from "cache-control-parser";

export const getMaxAge = (
  cacheControl: CacheControl,
  defaultMaxAge: number | undefined
): number | undefined => {
  return cacheControl.sharedMaxAge || cacheControl.maxAge || defaultMaxAge;
};
