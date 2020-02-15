import supertest from "supertest";
import { app } from "./server";

const request = supertest(app);

test("should cache text responses", async () => {
  const url = "/text";
  await request.get(url);
  const res = await request.get(url);

  expect(res.status).toBe(200);
  expect(res.header["x-cache"]).toEqual("HIT");
  expect(res.text).toEqual("hello world");
});

test("should cache json responses", async () => {
  const url = "/json";
  await request.get(url);
  const res = await request.get(url);

  expect(res.status).toBe(200);
  expect(res.header["x-cache"]).toEqual("HIT");
  expect(res.body).toEqual({
    hello: "world"
  });
});

test("should support buffers", async () => {
  const url = "/buffer";
  await request.get(url);
  const res = await request.get(url);

  expect(res.status).toBe(200);
  expect(res.header["x-cache"]).toEqual("HIT");
  expect(res.text).toEqual("hello world");
});

test("should cache empty response", async () => {
  const url = "/empty";
  await request.get(url);
  const res = await request.get(url);

  expect(res.status).toBe(200);
  expect(res.header["x-cache"]).toEqual("HIT");
  expect(res.text).toEqual("");
});

test("should cache empty response", async () => {
  const url = "/empty-2";
  await request.get(url);
  const res = await request.get(url);

  expect(res.status).toBe(200);
  expect(res.header["x-cache"]).toEqual("HIT");
  expect(res.text).toEqual("");
});

test("should cache multiple chunks", async () => {
  const url = "/multiple-chunks";
  await request.get(url);
  const res = await request.get(url);

  expect(res.status).toBe(200);
  expect(res.header["x-cache"]).toEqual("HIT");
  expect(res.text).toEqual("chunk1chunk2chunk3");
});

test("should cache multiple chunks", async () => {
  const url = "/multiple-chunks-2";
  await request.get(url);
  const res = await request.get(url);

  expect(res.status).toBe(200);
  expect(res.header["x-cache"]).toEqual("HIT");
  expect(res.text).toEqual("chunk1chunk2chunk3");
});

test("should not cache response with no-cache", async () => {
  const url = "/no-cache";
  await request.get(url);
  const res = await request.get(url);

  expect(res.status).toBe(200);
  expect(res.header["x-cache"]).toEqual("MISS");
});

test("should not cache response with no-store", async () => {
  const url = "/no-store";
  await request.get(url);
  const res = await request.get(url);

  expect(res.status).toBe(200);
  expect(res.header["x-cache"]).toEqual("MISS");
});

test("should not cache private response", async () => {
  const url = "/private";

  await request.get(url);
  const res = await request.get(url);

  expect(res.status).toBe(200);
  expect(res.header["x-cache"]).toEqual("MISS");
});

test("should not cache response with max-age=0", async () => {
  const url = "/max-age-0";

  await request.get(url);
  const res = await request.get(url);

  expect(res.status).toBe(200);
  expect(res.header["x-cache"]).toEqual("MISS");
});

test("should not cache response with max-age=NaN", async () => {
  const url = "/max-age-nan";

  await request.get(url);
  const res = await request.get(url);

  expect(res.status).toBe(200);
  expect(res.header["x-cache"]).toEqual("MISS");
});

test("should not cache response with invalid cache-control header", async () => {
  const url = "/invalid-cache-control";

  await request.get(url);
  const res = await request.get(url);

  expect(res.status).toBe(200);
  expect(res.header["x-cache"]).toEqual("MISS");
});
