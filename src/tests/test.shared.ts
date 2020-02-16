import supertest from "supertest";
import { app } from "./server";
import { sha256 } from "../utils";

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

  test("should cache empty response", async () => {
    const url = buildUrl("/empty");
    await request.get(url);
    await delay(delayMs);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("");
  });

  test("should cache empty response", async () => {
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
    expect(res.text).toEqual("chunk1chunk2chunk3");
  });

  test("should cache multiple chunks", async () => {
    const url = buildUrl("/multiple-chunks-2");
    await request.get(url);
    await delay(delayMs);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("chunk1chunk2chunk3");
  });

  test("should work with images", async () => {
    const url = buildUrl("/photo.jpeg");
    await request.get(url);
    await delay(delayMs);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(sha256(res.body)).toEqual(
      "f2799776f8f5cc149b94b9958d1d5801831d3d5715f55b32ce1111a77ce3d7b6"
    );
  });

  test("should cache response headers", async () => {
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

  describe("should not cache", () => {
    test("should not cache response with no-cache", async () => {
      const url = buildUrl("/no-cache");
      await request.get(url);
      const res = await request.get(url);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("MISS");
    });

    test("should not cache response with no-store", async () => {
      const url = buildUrl("/no-store");
      await request.get(url);
      const res = await request.get(url);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("MISS");
    });

    test("should not cache private response", async () => {
      const url = buildUrl("/private");

      await request.get(url);
      const res = await request.get(url);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("MISS");
    });

    test("should not cache response with max-age=0", async () => {
      const url = buildUrl("/max-age-0");
      await request.get(url);
      const res = await request.get(url);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("MISS");
    });

    test("should not cache response with max-age=NaN", async () => {
      const url = buildUrl("/max-age-nan");
      await request.get(url);
      const res = await request.get(url);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("MISS");
    });

    test("should not cache response with invalid cache-control header", async () => {
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

    test("should remove trailing question mark", async () => {
      const url1 = buildUrl("/text?");
      const url2 = buildUrl("/text");
      await request.get(url1);
      await delay(delayMs);
      const res = await request.get(url2);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("HIT");
    });

    test("should remove trailing slash", async () => {
      const url1 = buildUrl("/text/");
      const url2 = buildUrl("/text");
      await request.get(url1);
      await delay(delayMs);
      const res = await request.get(url2);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("HIT");
    });

    test("should remove trailing slash and question mark", async () => {
      const url1 = buildUrl("/text/?");
      const url2 = buildUrl("/text");
      await request.get(url1);
      await delay(delayMs);
      const res = await request.get(url2);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("HIT");
    });

    test("should remove utm tracking parameter", async () => {
      const url1 = buildUrl("/text?utm_source=source");
      const url2 = buildUrl("/text");
      await request.get(url1);
      await delay(delayMs);
      const res = await request.get(url2);

      expect(res.status).toBe(200);
      expect(res.header["x-cache"]).toEqual("HIT");
    });
  });
};
