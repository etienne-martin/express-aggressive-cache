export const parseCacheControl = (cacheControlHeader: string) => {
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

  return error ? null : header;
};
