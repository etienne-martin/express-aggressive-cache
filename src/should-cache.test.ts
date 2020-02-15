import { shouldCache } from "./should-cache";

describe("shouldCache", () => {
  test("should cache if cache-control header is not defined", () => {
    expect(shouldCache({})).toEqual(true);
  });
});
