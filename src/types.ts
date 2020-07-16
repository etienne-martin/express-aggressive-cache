import http from "http";
import { Request, Response } from "express";

export type DefaultGetCacheKey = (args: {
  req: Request;
  res: Response;
}) => string;

type GetCacheKeySync = (args: {
  req: Request;
  res: Response;
  normalizedUrl: string;
}) => string;

type GetCacheKeyAsync = (args: {
  req: Request;
  res: Response;
  normalizedUrl: string;
}) => Promise<string>;

export type GetCacheKey = GetCacheKeySync | GetCacheKeyAsync;

export type Chunk = string | Buffer;

export type PurgeFunction = (tag: string) => void;

export interface Options {
  /**
   * If the response has a max-age header, it will use it as the TTL.
   * Value should be provided in seconds.
   * Otherwise, it will expire the resource using the maxAge option (defaults to Infinity).
   */
  maxAge?: number;
  /**
   * Specify a different data store. Default to in-memory caching.
   */
  store?: <T>() => Store<T>;
  /**
   * Function used to generate cache keys.
   */
  getCacheKey?: GetCacheKey;
  /**
   * A flag to toggle debug logs
   * Defaults to false.
   */
  debug?: boolean;
}

export interface CachedResponse {
  requestId: string;
  chunks: string[];
  statusCode: number;
  headers: http.OutgoingHttpHeaders;
  maxAge: number | undefined;
  isSealed: boolean;
}

export interface Store<T> {
  has: (keys: string[]) => Promise<boolean>;
  get: (key: string) => Promise<T | undefined>;
  set: (key: string, value: T, maxAge: number | undefined) => Promise<void>;
}

export interface ExtendedResponse extends Response {
  aggressiveCache?: {
    chunks?: string[];
  };
}
