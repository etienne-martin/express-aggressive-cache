import Redis from "ioredis";
import { sharedTests } from "./test.shared";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

beforeEach(async () => {
  // Flush redis db before tests
  await delay(100);
  const client = new Redis("//localhost:6379");
  await client.flushall();
});

sharedTests("redis", 100);
