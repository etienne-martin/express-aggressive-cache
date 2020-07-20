import { URL } from "url";
import normalizeUrl from "normalize-url";
import { DefaultGetCacheKey } from "./types";

const escapeDirectoryTraversalNotation = (url: string) => {
  return url.replace(/\.\./g, "_DOTDOT_");
};

const UnescapeDirectoryTraversalNotation = (url: string) => {
  return url.replace(/_DOTDOT_/g, "..");
};

const removeUtmTrackingParameter = (url: string) => {
  return normalizeUrl(url, {
    removeQueryParameters: [/^utm_\w+/i]
  });
};

export const defaultGetCacheKey: DefaultGetCacheKey = ({ req }) => {
  const escapedUrl = escapeDirectoryTraversalNotation(req.originalUrl);
  const absoluteUrl = new URL(escapedUrl, "http://localhost").toString();

  const { origin } = new URL(absoluteUrl);
  const normalizedPath = removeUtmTrackingParameter(absoluteUrl)
    .replace(origin, "")
    .replace("/?", "");
  return UnescapeDirectoryTraversalNotation(normalizedPath);
};
