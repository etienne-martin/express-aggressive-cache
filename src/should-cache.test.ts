import { shouldCache } from "./should-cache";

test("should cache if cache-control header is not defined", () => {
  expect(shouldCache({})).toEqual(true);
});
