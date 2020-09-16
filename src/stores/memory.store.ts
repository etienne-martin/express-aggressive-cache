import LRU from "lru-cache";
import { Store } from "../types";

interface MemoryStoreOptions {
  /**
   * The maximum size of the cache, checked by applying the length
   * function to all values in the cache. Defaults to `Infinity`.
   */
  max?: number;
}

const defaultOptions = {
  max: undefined
};

export const memoryStore = (options?: MemoryStoreOptions) => {
  const { max } = {
    ...defaultOptions,
    ...options
  };

  return <T>() => {
    const memoryCache = new LRU<string, T>({ max });

    const del = async (key: string) => {
      memoryCache.del(key);
    };

    const expire = async (key: string, seconds: number) => {
      const value = memoryCache.peek(key);
      if (value !== undefined) {
        if (seconds <= 0) {
          memoryCache.del(key);
        } else {
          memoryCache.set(key, value, seconds * 1000);
        }
      }
    };

    const get = async (key: string) => {
      return memoryCache.get(key);
    };

    const has = async (keys: string[]) => {
      for (const key of keys) {
        if (!memoryCache.has(key)) return false;
      }

      return true;
    };

    const set = async (key: string, value: T, maxAge: number | undefined) => {
      memoryCache.set(key, value, maxAge ? maxAge * 1000 : undefined);
    };

    const store: Store<T> = {
      del,
      expire,
      get,
      has,
      set
    };

    return store;
  };
};
