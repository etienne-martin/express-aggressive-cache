import Redis from "ioredis";
import { sharedTests } from "./test.shared";

beforeEach(async () => {
  // Flush redis db before tests
  const client = new Redis("//localhost:6379");

  await client.flushall();

  console.log("expiration", await client.keys("*"));
});

sharedTests("redis", 100);
