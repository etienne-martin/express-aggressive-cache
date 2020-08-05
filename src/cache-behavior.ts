import { OnCache } from ".";

export const defaultOnCacheHit: OnCache = ({ res }) => {
  res.setHeader("x-cache", "HIT");
};

export const defaultOnCacheMiss: OnCache = ({ res }) => {
  res.setHeader("x-cache", "MISS");
};
