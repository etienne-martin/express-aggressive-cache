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

    const has = async (keys: string[]) => {
      for (const key of keys) {
        if (!memoryCache.has(key)) return false;
      }

      return true;
    };

    const get = async (key: string) => {
      return memoryCache.get(key);
    };

    const set = async (key: string, value: T, maxAge: number | undefined) => {
      memoryCache.set(key, value, maxAge ? maxAge * 1000 : undefined);
    };

    const del = async (key: string) => {
      memoryCache.del(key);
    };

    const store: Store<T> = {
      has,
      get,
      set,
      del
    };

    return store;
  };
};
