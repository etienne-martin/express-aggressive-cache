import supertest from "supertest";
import { app } from "./server";
import { sha256 } from "../utils";
import Redis from "ioredis";

const request = supertest(app);

export const sharedTests = (store: string, delayMs = 0) => {
  const buildUrl = (url: string) => `/${store}${url}`;
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

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

    test("should not cache responses with max-age=NaN", async () => {
      const url = buildUrl("/max-age-nan");
      await request.get(url);
      const res = await request.get(url);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("MISS");
    });

    test("should not cache responses with invalid cache-control header", async () => {
      const url = buildUrl("/invalid-cache-control");
      await request.get(url);
      const res = await request.get(url);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("MISS");
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

  describe("url normalization", () => {
    test("should reorder query params", async () => {
      const url1 = buildUrl("/text?a=1&b=2");
      const url2 = buildUrl("/text?b=2&a=1");
      await request.get(url1);
      await delay(delayMs);
      const res = await request.get(url2);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("HIT");
    });

    test("should not rewrite urls with directory traversal notation", async () => {
      const url1 = buildUrl("/test/test/../");
      const url2 = buildUrl("/test/");
      await request.get(url1);
      await delay(delayMs);
      const res = await request.get(url2);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("MISS");
    });

    test("should remove trailing question mark", async () => {
      const client = new Redis("//localhost:6379");
      const test = await client.keys(".");

      console.log("url normalization", test);

      const url1 = buildUrl("/text");
      const url2 = buildUrl("/text?");
      await request.get(url1);
      await delay(delayMs);
      const res = await request.get(url2);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("HIT");
    });

    test("should remove trailing slash", async () => {
      const url1 = buildUrl("/text");
      const url2 = buildUrl("/text/");
      await request.get(url1);
      await delay(delayMs);
      const res = await request.get(url2);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("HIT");
    });

    test("should remove trailing slash and question mark", async () => {
      const url1 = buildUrl("/text");
      const url2 = buildUrl("/text/?");
      await request.get(url1);
      await delay(delayMs);
      const res = await request.get(url2);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("HIT");
    });

    test("should remove utm tracking parameter", async () => {
      const url1 = buildUrl("/text");
      const url2 = buildUrl("/text?utm_source=source");
      await request.get(url1);
      await delay(delayMs);
      const res = await request.get(url2);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("HIT");
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
      await delay(3000);
      const res3 = await request.get(url);

      expect(res1.header["x-cache"]).toEqual("MISS");
      expect(res2.header["x-cache"]).toEqual("HIT");
      expect(res3.header["x-cache"]).toEqual("MISS");
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
    });

    test("should expire cache after 2s", async () => {
      const client = new Redis("//localhost:6379");
      const test = await client.keys(".");

      console.log("expiration", test);

      const url = buildUrl(`/exp/max-age`);
      const res1 = await request.get(url);
      await delay(delayMs);
      const res2 = await request.get(url);
      await delay(3000);
      const res3 = await request.get(url);

      expect(res1.header["x-cache"]).toEqual("MISS");
      expect(res2.header["x-cache"]).toEqual("HIT");
      expect(res3.header["x-cache"]).toEqual("MISS");
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
    });
  });

  describe("cookie", () => {
    test("shouldn't cache cookies that were set by previous middlewares", async () => {
      const url = buildUrl(`/upstream-cookie`);
      const res1 = await request.get(url);
      await delay(delayMs);
      const res2 = await request.get(url);
      const res1Cookie = res1.header["set-cookie"];
      const res2Cookie = res2.header["set-cookie"];

      expect(res1.header["x-cache"]).toEqual("MISS");
      expect(res2.header["x-cache"]).toEqual("HIT");
      expect(res1Cookie).toBeDefined();
      expect(res2Cookie).toBeDefined();
      expect(res1Cookie).not.toEqual(res2Cookie);
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
    });

    test("shouldn't cache cookies that were set by previous middlewares", async () => {
      const url = buildUrl(`/upstream-cookie-multiple`);
      const res1 = await request.get(url);
      await delay(delayMs);
      const res2 = await request.get(url);
      const res1Cookie = res1.header["set-cookie"];
      const res2Cookie = res2.header["set-cookie"];

      expect(res1.header["x-cache"]).toEqual("MISS");
      expect(res2.header["x-cache"]).toEqual("HIT");
      expect(res1Cookie).toBeDefined();
      expect(res2Cookie).toBeDefined();
      expect(res1Cookie).not.toEqual(res2Cookie);
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
    });

    test("should cache cookies that were set after hitting the cache middleware", async () => {
      const url = buildUrl(`/set-cookie`);
      const res1 = await request.get(url);
      await delay(delayMs);
      const res2 = await request.get(url);
      const res1Cookie = res1.header["set-cookie"];
      const res2Cookie = res2.header["set-cookie"];

      expect(res1.header["x-cache"]).toEqual("MISS");
      expect(res2.header["x-cache"]).toEqual("HIT");
      expect(res1Cookie).toBeDefined();
      expect(res1Cookie).toEqual(res2Cookie);
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
    });

    test("should cache cookies that were set after hitting the cache middleware", async () => {
      const url = buildUrl(`/upstream-cookie-and-set-cookie`);
      const res1 = await request.get(url);
      await delay(delayMs);
      const res2 = await request.get(url);
      const res1Cookie = res1.header["set-cookie"];
      const res2Cookie = res2.header["set-cookie"];

      expect(res1.header["x-cache"]).toEqual("MISS");
      expect(res2.header["x-cache"]).toEqual("HIT");
      expect(res1Cookie.length).toEqual(2);
      expect(res2Cookie.length).toEqual(2);
      expect(res1Cookie).not.toEqual(res2Cookie);
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
    });
  });
};
