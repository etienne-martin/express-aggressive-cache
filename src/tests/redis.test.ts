import Redis from "ioredis";
import { sharedTests } from "./test.shared";
import { redisCache as cache } from "./server";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

afterEach(async () => {
  // Flush redis db before tests
  await delay(100);
  const client = new Redis("//localhost:6379");
  await client.flushall();
});

sharedTests("redis", cache.purge, 100);
