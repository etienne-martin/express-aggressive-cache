// Cache-Control for Civilians
// https://csswizardry.com/2019/03/cache-control-for-civilians/

import { CacheControl } from "cache-control-parser";

export const shouldCache = (cacheControl: CacheControl) => {
  const { noStore, isPrivate, maxAge, sharedMaxAge } = cacheControl;

  if (noStore) return false;
  if (isPrivate) return false;

  if (sharedMaxAge !== undefined) {
    if (sharedMaxAge === 0) return false;
  } else if (maxAge === 0) {
    return false;
  }

  return true;
};
