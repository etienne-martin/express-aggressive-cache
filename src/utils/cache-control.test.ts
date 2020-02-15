import { parseCacheControl } from "./cache-control";

test("should not fail if the header is empty", () => {
  expect(parseCacheControl("")).toEqual({});
});

test("should return a number", () => {
  expect(parseCacheControl("max-age=1")).toEqual({
    "max-age": 1
  });
});

test("should return a boolean", () => {
  expect(parseCacheControl("private")).toEqual({
    private: true
  });
});

test("should return null if the header cannot be parsed", () => {
  expect(parseCacheControl("max-age=NaN")).toEqual(null);
});

test("should return null if the header cannot be parsed", () => {
  expect(parseCacheControl("A*W&D?&*dty78=auwdtatd7*ADT?")).toEqual(null);
});
