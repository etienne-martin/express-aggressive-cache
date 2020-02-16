import { URL } from "url";
import normalizeUrl from "normalize-url";
import { DefaultGetCacheKey } from "./types";

export const defaultGetCacheKey: DefaultGetCacheKey = ({ req }) => {
  const url = new URL(req.originalUrl, "http://localhost").toString();
  const { origin } = new URL(url);

  const baseKey = normalizeUrl(url, {
    // Remove utm tacking parameter
    removeQueryParameters: [/^utm_\w+/i]
  });

  const normalizedUrl = baseKey.replace(origin, "").replace("/?", "");

  return `${req.method}:${normalizedUrl}`;
};
