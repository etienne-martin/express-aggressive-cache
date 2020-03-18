import Redis from "ioredis";
import { sharedTests } from "./test.shared";

afterEach(async () => {
  // Flush redis db before tests
  const client = new Redis("//localhost:6379");
  await client.flushall();
});

sharedTests("redis", 100);
