import { defaultGetCacheKey } from "./cache-key";

describe("cache-key", () => {
  test("should not rewrite urls with directory traversal notation", () => {
    expect(
      defaultGetCacheKey({
        req: {
          originalUrl: "/test/test/../"
        }
      } as any)
    ).not.toEqual(
      defaultGetCacheKey({
        req: {
          originalUrl: "/test/"
        }
      } as any)
    );
  });
});
