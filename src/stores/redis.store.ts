import Redis from "ioredis";
import Redlock from "redlock";
import { Store } from "../types";

interface RedisStoreOptions {
  /**
   * An instance of redis or a redis compatible client.
   *
   * Known compatible and tested clients:
   * ioredis
   */
  client: Redis.Redis;
  /**
   * Key prefix in Redis (default: cache).
   *
   * This prefix appends to whatever prefix you may have set on the client itself.
   * Note: You may need unique prefixes for different applications sharing the same Redis instance.
   */
  prefix?: string;
}

const defaultOptions = {
  prefix: "cache"
};

const REDLOCK_TTL = 5000;

const supportedDataTypes = ["string", "buffer", "object"] as const;
type SupportedDataType = typeof supportedDataTypes[number];

const TYPE_PREFIX_LENGTH = Math.max(
  ...supportedDataTypes.map(type => type.length)
);

const serializeValue = <T>(key: string, value: T): Buffer => {
  let type: SupportedDataType | undefined;
  let valueBuffer: Buffer | undefined;

  if (Buffer.isBuffer(value)) {
    type = "buffer";
    valueBuffer = value;
  } else if (typeof value === "string") {
    type = "string";
    valueBuffer = Buffer.from(value, "utf8");
  } else if (typeof value === "object") {
    type = "object";
    valueBuffer = Buffer.from(JSON.stringify(value), "utf8");
  }

  if (!type) throw new Error("unsupported data type");
  if (!valueBuffer) throw new Error("unexpected error");

  const typePrefix = Buffer.from(type, "utf8");

  return Buffer.concat([typePrefix, valueBuffer]);
};

const prefixKey = (key: string, prefix: string | undefined) => {
  return [prefix, key].filter(i => i).join(":");
};

export const redisStore = (options: RedisStoreOptions) => {
  const { client, prefix } = {
    ...defaultOptions,
    ...options
  };

  const redlock = new Redlock([client], {
    retryCount: 0
  });

  return <T>() => {
    const has = async (keys: string[]) => {
      const prefixedKeys = keys.map(key => prefixKey(key, prefix));
      const count = await client.exists(...prefixedKeys);

      return count === keys.length;
    };

    const get = async (key: string) => {
      const prefixedKey = prefixKey(key, prefix);
      const buffer = await client.getBuffer(prefixedKey);

      if (buffer === null) return;

      const type = buffer.subarray(0, TYPE_PREFIX_LENGTH).toString("utf8");
      const value = buffer.subarray(TYPE_PREFIX_LENGTH, buffer.length);

      if (type === "object") {
        return JSON.parse(value.toString("utf8"));
      }

      if (type === "string") {
        return value.toString("utf8");
      }

      if (type === "buffer") {
        return value;
      }

      throw new Error("Unknown data type");
    };

    /**
     * 1. We store everything as a Buffer in redis
     * 2. The first 6 bytes of the Buffer are used to keep track of the original data type (typePrefix)
     * 3. JSON objects are stringified prior to being converted to a Buffer
     */
    const set = async (key: string, value: T, maxAge: number | undefined) => {
      let lock;
      try {
        lock = await redlock.lock(
          prefixKey(`locks:${key}`, prefix),
          REDLOCK_TTL
        );
      } catch (err) {
        // we ignore lock errors caused by concurrent requests attempting to create a cache entry
        if (err.name === "LockError") return;
        throw err;
      }
      const prefixedKey = prefixKey(key, prefix);
      const buffer = serializeValue<T>(prefixedKey, value);

      if (maxAge) {
        await client.set(prefixedKey, buffer, "EX", maxAge);
      } else {
        await client.set(prefixedKey, buffer);
      }

      await lock.unlock();
    };

    const del = async (...keys: string[]) => {
      await client.del(
        ...keys.map(key => {
          return prefixKey(key, prefix);
        })
      );
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
