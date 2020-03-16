import { URL } from "url";
import normalizeUrl from "normalize-url";
import { DefaultGetCacheKey } from "./types";

export const defaultGetCacheKey: DefaultGetCacheKey = ({ req }) => {
  // Escape directory traversal notation
  const originalUrl = req.originalUrl.replace(/\.\./g, "_DOTDOT_");
  const url = new URL(originalUrl, "http://localhost").toString();
  const { origin } = new URL(url);

  const baseKey = normalizeUrl(url, {
    // Remove utm tacking parameter
    removeQueryParameters: [/^utm_\w+/i]
  });

  const normalizedUrl = baseKey
    .replace(origin, "")
    .replace("/?", "")
    // Unescape directory traversal notation
    .replace(/_DOTDOT_/g, "..");

  return `${req.method}:${normalizedUrl}`;
};
