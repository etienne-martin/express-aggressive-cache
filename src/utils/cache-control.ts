export const parseCacheControl = (
  cacheControlHeader: string
): Record<string, string | number> | null => {
  const regex = /(?:^|(?:\s*\,\s*))([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)(?:\=(?:([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)|(?:\"((?:[^"\\]|\\.)*)\")))?/g;
  const header: Record<string, any> = {};

  const error = cacheControlHeader.replace(regex, ($0, $1, $2, $3) => {
    const value = $2 || $3;

    header[$1] = value ? value.toLowerCase() : true;

    return "";
  });

  if (header["max-age"]) {
    try {
      const maxAge = parseInt(header["max-age"], 10);

      if (isNaN(maxAge)) return null;

      header["max-age"] = maxAge;
    } catch {}
  }

  if (header["s-maxage"]) {
    try {
      const sMaxAge = parseInt(header["s-maxage"], 10);

      if (isNaN(sMaxAge)) return null;

      header["s-maxage"] = sMaxAge;
    } catch {}
  }

  return error ? null : header;
};

export const getMaxAge = (
  cacheControl: Record<string, any> | null,
  defaultMaxAge: number | undefined
): number | undefined => {
  return (
    cacheControl?.["s-maxage"] || cacheControl?.["max-age"] || defaultMaxAge
  );
};
