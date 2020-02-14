import { shouldCache } from "./should-cache";

describe("shouldCache", () => {
  test("should fallback to caching if no cache headers are found", () => {
    expect(shouldCache({})).toEqual(true);
  });
});
