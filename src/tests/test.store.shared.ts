import { Store } from "../types";

export const storeSharedTests = (store: <T>() => Store<T>) => {
  const KEY = "key";
  const VALUE = "value";

  const bucket = store<string>();

  test("store del should delete entry", async () => {
    await bucket.set(KEY, VALUE);
    await bucket.del(KEY);
    expect(await bucket.get(KEY)).toEqual(undefined);
  });

  test("store set and get should return value", async () => {
    await bucket.set(KEY, VALUE);
    expect(await bucket.get(KEY)).toEqual(VALUE);
  });

  test("store set and expire with 0 seconds should delete entry", async () => {
    await bucket.set(KEY, VALUE);
    await bucket.expire(KEY, 0);
    expect(await bucket.get(KEY)).toEqual(undefined);
  });

  test("store set and expire with 1 hour should keep entry", async () => {
    await bucket.set(KEY, VALUE);
    await bucket.expire(KEY, 3600);
    expect(await bucket.get(KEY)).toEqual(VALUE);
  });
};
