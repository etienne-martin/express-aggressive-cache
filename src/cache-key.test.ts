import { defaultGetCacheKey } from "./cache-key";

describe("url normalization", () => {
  test("should reorder query params", async () => {
    expect(
      defaultGetCacheKey({
        req: {
          method: "GET",
          originalUrl: "/text?a=1&b=2"
        }
      } as any)
    ).toEqual(
      defaultGetCacheKey({
        req: {
          method: "GET",
          originalUrl: "/text?b=2&a=1"
        }
      } as any)
    );
  });

  test("should not rewrite urls with directory traversal notation", async () => {
    expect(
      defaultGetCacheKey({
        req: {
          method: "GET",
          originalUrl: "/test/test/../"
        }
      } as any)
    ).not.toEqual(
      defaultGetCacheKey({
        req: {
          method: "GET",
          originalUrl: "/test/"
        }
      } as any)
    );
  });

  test("should remove trailing question mark", async () => {
    expect(
      defaultGetCacheKey({
        req: {
          method: "GET",
          originalUrl: "/text"
        }
      } as any)
    ).toEqual(
      defaultGetCacheKey({
        req: {
          method: "GET",
          originalUrl: "/text?"
        }
      } as any)
    );
  });

  test("should remove trailing slash", async () => {
    expect(
      defaultGetCacheKey({
        req: {
          method: "GET",
          originalUrl: "/text"
        }
      } as any)
    ).toEqual(
      defaultGetCacheKey({
        req: {
          method: "GET",
          originalUrl: "/text/"
        }
      } as any)
    );
  });

  test("should remove trailing slash and question mark", async () => {
    expect(
      defaultGetCacheKey({
        req: {
          method: "GET",
          originalUrl: "/text"
        }
      } as any)
    ).toEqual(
      defaultGetCacheKey({
        req: {
          method: "GET",
          originalUrl: "/text/?"
        }
      } as any)
    );
  });

  test("should remove utm tracking parameter", async () => {
    expect(
      defaultGetCacheKey({
        req: {
          method: "GET",
          originalUrl: "/text"
        }
      } as any)
    ).toEqual(
      defaultGetCacheKey({
        req: {
          method: "GET",
          originalUrl: "/text/?utm_source=source"
        }
      } as any)
    );
  });
});
