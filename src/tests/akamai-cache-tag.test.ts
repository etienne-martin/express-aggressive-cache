import { akamaiGetCacheTag } from "./akamai-cache-tag";

describe("Akamai get cache tag", () => {
  test("Edge-Cache-Tag header should return header value", async () => {
    const HEADER_VALUE = "headerValue";
    expect(
      akamaiGetCacheTag({
        res: {
          getHeader: (name: string) => {
            return name === "Edge-Cache-Tag" ? HEADER_VALUE : undefined;
          }
        }
      } as any)
    ).toEqual(HEADER_VALUE);
  });
  test("no header should return undefined", async () => {
    expect(
      akamaiGetCacheTag({
        res: {
          getHeader: () => {
            return undefined;
          }
        }
      } as any)
    ).toEqual(undefined);
  });
});
