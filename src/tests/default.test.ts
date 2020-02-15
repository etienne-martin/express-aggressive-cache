import supertest from "supertest";
import { app } from "./server";

const request = supertest(app);

// TODO: test static files
// TODO: test gzipped responses
// TODO: test normalized urls (query params)

describe("Default configuration", () => {
  test("should cache text responses", async () => {
    const url = "/default/text";
    await request.get(url);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("hello world");
  });

  test("should cache json responses", async () => {
    const url = "/default/json";
    await request.get(url);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.body).toEqual({
      hello: "world"
    });
  });

  test("should support buffers", async () => {
    const url = "/default/buffer";
    await request.get(url);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("hello world");
  });

  test("should cache empty response", async () => {
    const url = "/default/empty";
    await request.get(url);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("");
  });

  test("should cache empty response", async () => {
    const url = "/default/empty-2";
    await request.get(url);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("");
  });

  test("should cache multiple chunks", async () => {
    const url = "/default/multiple-chunks";
    await request.get(url);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("chunk1chunk2chunk3");
  });

  test("should cache multiple chunks", async () => {
    const url = "/default/multiple-chunks-2";
    await request.get(url);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("chunk1chunk2chunk3");
  });

  test("should cache response headers", async () => {
    const url = "/default/custom-header";
    await request.get(url);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.header["custom-header"]).toEqual("hello");
  });

  test("should cache status codes", async () => {
    const url = "/default/forbidden";
    await request.get(url);
    const res = await request.get(url);

    expect(res.status).toBe(403);
    expect(res.header["x-cache"]).toEqual("HIT");
  });

  test("should not cache response with no-cache", async () => {
    const url = "/default/no-cache";
    await request.get(url);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("MISS");
  });

  test("should not cache response with no-store", async () => {
    const url = "/default/no-store";
    await request.get(url);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("MISS");
  });

  test("should not cache private response", async () => {
    const url = "/default/private";

    await request.get(url);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("MISS");
  });

  test("should not cache response with max-age=0", async () => {
    const url = "/default/max-age-0";

    await request.get(url);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("MISS");
  });

  test("should not cache response with max-age=NaN", async () => {
    const url = "/default/max-age-nan";

    await request.get(url);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("MISS");
  });

  test("should not cache response with invalid cache-control header", async () => {
    const url = "/default/invalid-cache-control";

    await request.get(url);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("MISS");
  });

  test("should not cache POST requests", async () => {
    const url = "/default/text";

    await request.post(url);
    const res = await request.post(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("MISS");
  });

  test("should not cache PUT requests", async () => {
    const url = "/default/text";

    await request.put(url);
    const res = await request.put(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("MISS");
  });

  test("should not cache PATCH requests", async () => {
    const url = "/default/text";

    await request.patch(url);
    const res = await request.patch(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("MISS");
  });
});
