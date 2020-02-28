// Cache-Control for Civilians
// https://csswizardry.com/2019/03/cache-control-for-civilians/

export const shouldCache = (cacheControl: Record<string, any> | null) => {
  if (cacheControl === null) return false;

  const noStore = cacheControl["no-store"];
  const isPrivate = cacheControl["private"];
  const maxAge = cacheControl["max-age"];
  const sharedMaxAge = cacheControl["s-maxage"];

  if (noStore) return false;
  if (isPrivate) return false;

  if (sharedMaxAge !== undefined) {
    if (sharedMaxAge === 0) return false;
  } else if (maxAge === 0) {
    return false;
  }

  return true;
};
