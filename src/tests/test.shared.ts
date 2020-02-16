import supertest from "supertest";
import { app } from "./server";

const request = supertest(app);

// TODO: test static files
// TODO: test gzipped responses
// TODO: test normalized urls (query params)

const DELAY = 100;
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const sharedTests = (store: string) => {
  const buildUrl = (url: string) => `/${store}${url}`;

  test("should cache text responses", async () => {
    const url = buildUrl("/text");
    await request.get(url);
    await delay(DELAY);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("hello world");
  });

  test("should cache json responses", async () => {
    const url = buildUrl("/json");
    await request.get(url);
    await delay(DELAY);
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
    await delay(DELAY);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("hello world");
  });

  test("should cache empty response", async () => {
    const url = buildUrl("/empty");
    await request.get(url);
    await delay(DELAY);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("");
  });

  test("should cache empty response", async () => {
    const url = buildUrl("/empty-2");
    await request.get(url);
    await delay(DELAY);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("");
  });

  test("should cache multiple chunks", async () => {
    const url = buildUrl("/multiple-chunks");
    await request.get(url);
    await delay(DELAY);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("chunk1chunk2chunk3");
  });

  test("should cache multiple chunks", async () => {
    const url = buildUrl("/multiple-chunks-2");
    await request.get(url);
    await delay(DELAY);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("chunk1chunk2chunk3");
  });

  test("should cache response headers", async () => {
    const url = buildUrl("/custom-header");
    await request.get(url);
    await delay(DELAY);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.header["custom-header"]).toEqual("hello");
  });

  test("should cache status codes", async () => {
    const url = buildUrl("/forbidden");
    await request.get(url);
    await delay(DELAY);
    const res = await request.get(url);

    expect(res.status).toBe(403);
    expect(res.header["x-cache"]).toEqual("HIT");
  });

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
};
