import supertest from "supertest";
import { app } from "./server";

const request = supertest(app);

describe("Redis", () => {
  test("should cache responses in redis", async done => {
    const url = "/redis";
    await request.get(url);
    const res = await request.get(url);

    expect(res.status).toBe(200);
    expect(res.header["x-cache"]).toEqual("HIT");
    expect(res.text).toEqual("hello world");
    done();
  });
});
