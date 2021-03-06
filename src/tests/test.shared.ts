import supertest from "supertest";
import { app } from "./server";
import { sha256 } from "../utils";
import { PurgeFunction } from "../";

const request = supertest(app);

export const sharedTests = (
  store: string,
  purge: PurgeFunction,
  delayMs = 0
) => {
  const buildUrl = (url: string) => `/${store}${url}`;
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  test("purge missing tag does not throw", async () => {
    await purge("missing tag");
  });

  test("purge function for request with Akamai tag header purges cache entry", async () => {
    const url = buildUrl("/purge");
    await request.get(url);
    await delay(delayMs);
    await purge("baa0ddc2-d441-4039-ac2c-ecd32076e0b7");
    await delay(delayMs);
    const res = await request.get(url);
    await delay(delayMs);
    expect(res.header["x-cache"]).toEqual("MISS");
  });

  test("should cache text responses", async () => {
    const url = buildUrl("/text");
    await request.get(url);
    await delay(delayMs);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("hello world");
  });

  test("should cache json responses", async () => {
    const url = buildUrl("/json");
    await request.get(url);
    await delay(delayMs);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.body).toEqual({
      hello: "world"
    });
  });

  test("should support buffers", async () => {
    const url = buildUrl("/buffer");
    await request.get(url);
    await delay(delayMs);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("hello world");
  });

  test("should cache empty responses", async () => {
    const url = buildUrl("/empty");
    await request.get(url);
    await delay(delayMs);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("");
  });

  test("should cache empty responses", async () => {
    const url = buildUrl("/empty-2");
    await request.get(url);
    await delay(delayMs);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("");
  });

  test("should cache multiple chunks", async () => {
    const url = buildUrl("/multiple-chunks");
    await request.get(url);
    await delay(delayMs);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("chunk1chunk2");
  });

  test("should cache multiple chunks", async () => {
    const url = buildUrl("/multiple-chunks-2");
    await request.get(url);
    await delay(delayMs);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("chunk1chunk2");
  });

  test("should cache images", async () => {
    const url = buildUrl("/photo.jpeg");
    await request.get(url);
    await delay(delayMs);
    await delay(delayMs);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(sha256(res.body)).toEqual(
      "f2799776f8f5cc149b94b9958d1d5801831d3d5715f55b32ce1111a77ce3d7b6"
    );
  });

  test("should cache responses headers", async () => {
    const url = buildUrl("/custom-header");
    await request.get(url);
    await delay(delayMs);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.header["custom-header"]).toEqual("hello");
  });

  test("should cache status codes", async () => {
    const url = buildUrl("/forbidden");
    await request.get(url);
    await delay(delayMs);
    const res = await request.get(url);

    expect(res.status).toBe(403);
    expect(res.header["x-cache"]).toEqual("HIT");
  });

  describe("should honor the cache control header", () => {
    test("should not cache responses with no-store directive", async () => {
      const url = buildUrl("/no-store");
      await request.get(url);
      const res = await request.get(url);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("MISS");
    });

    test("should not cache responses with private directive", async () => {
      const url = buildUrl("/private");
      await request.get(url);
      const res = await request.get(url);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("MISS");
    });

    test("should not cache responses with s-maxage=0", async () => {
      const url = buildUrl("/max-age-0");
      await request.get(url);
      const res = await request.get(url);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("MISS");
    });

    test("should not cache responses with max-age=0", async () => {
      const url = buildUrl("/max-age-0");
      await request.get(url);
      const res = await request.get(url);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("MISS");
    });

    test("should ignore the max-age directive if s-maxage is present", async () => {
      const url = buildUrl("/multiple-maxage");
      await request.get(url);
      await delay(delayMs);
      const res = await request.get(url);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("HIT");
    });
  });

  describe("http method", () => {
    test("should not cache POST requests", async () => {
      const url = buildUrl("/text");
      await request.post(url);
      const res = await request.post(url);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("MISS");
    });

    test("should not cache PUT requests", async () => {
      const url = buildUrl("/text");
      await request.put(url);
      const res = await request.put(url);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("MISS");
    });

    test("should not cache PATCH requests", async () => {
      const url = buildUrl("/text");
      await request.patch(url);
      const res = await request.patch(url);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("MISS");
    });
  });

  describe("concurrency", () => {
    test("should support concurrent requests", async () => {
      const url = buildUrl("/photo.jpeg?parallel=1");
      await Promise.all([request.get(url), request.get(url)]);
      await delay(delayMs);
      await delay(delayMs);
      const res = await request.get(url);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("HIT");
    });
  });

  describe("expiration", () => {
    test("should expire cache after 2s", async () => {
      const url = buildUrl(`/exp/s-maxage`);
      const res1 = await request.get(url);
      await delay(delayMs);
      const res2 = await request.get(url);
      await delay(2000);
      const res3 = await request.get(url);

      expect(res1.header["x-cache"]).toEqual("MISS");
      expect(res2.header["x-cache"]).toEqual("HIT");
      expect(res3.header["x-cache"]).toEqual("MISS");
    });

    test("should expire cache after 2s", async () => {
      const url = buildUrl(`/exp/max-age`);
      const res1 = await request.get(url);
      await delay(delayMs);
      const res2 = await request.get(url);
      await delay(2000);
      const res3 = await request.get(url);

      expect(res1.header["x-cache"]).toEqual("MISS");
      expect(res2.header["x-cache"]).toEqual("HIT");
      expect(res3.header["x-cache"]).toEqual("MISS");
    });
  });

  describe("cookie", () => {
    test("should NEVER return cookies on cache hit", async () => {
      const url = buildUrl(`/set-cookie`);
      const res1 = await request.get(url);
      await delay(delayMs);
      const res2 = await request.get(url);

      expect(res1.header["x-cache"]).toEqual("MISS");
      expect(res2.header["x-cache"]).toEqual("HIT");
      expect(res1.header["set-cookie"]).toBeDefined();
      expect(res2.header["set-cookie"]).toBeUndefined();
    });
  });
};
