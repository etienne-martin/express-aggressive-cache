export const normalizeSetCookieHeaders = (
  header: number | string | string[] | undefined
): string[] | undefined => {
  if (typeof header === "string") {
    return [header];
  }

  if (typeof header === "number") {
    return;
  }

  return header;
};

export const removeUpstreamCookies = (
  upstreamSetCookieHeaders: string[] | undefined,
  setCookieHeaders: string[] | undefined
): string[] | undefined => {
  if (!setCookieHeaders) return;
  if (!upstreamSetCookieHeaders) return setCookieHeaders;

  if (upstreamSetCookieHeaders && setCookieHeaders) {
    const newSetCookieHeaders = setCookieHeaders.filter(setCookieHeader => {
      return !upstreamSetCookieHeaders.includes(setCookieHeader);
    });

    if (newSetCookieHeaders.length) {
      return newSetCookieHeaders;
    }
  }
};
