import Redis from "ioredis";
import { sharedTests } from "./test.shared";
import { redisCache as cache } from "./server";
import { storeSharedTests } from "./test.store.shared";
import { redisStore } from "../";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const client = new Redis("//localhost:6379");

beforeEach(async function flushDbBeforeEachTest() {
  await client.flushall();
  // wait for flushall to complete
  await delay(100);
});

sharedTests("redis", cache.purge, 100);
storeSharedTests(redisStore({ client }));
