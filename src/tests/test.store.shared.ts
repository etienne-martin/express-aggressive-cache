import { Store } from "../types";

export const storeSharedTests = (store: <T>() => Store<T>) => {
  const KEY = "key";
  const VALUE = "value";

  const bucket = store<string>();
  test("store del should delete entries", async () => {
    const KEY = "key1";
    const KEY_2 = "key2";
    await bucket.set(KEY, "value1");
    await bucket.set(KEY_2, "value2");
    await bucket.del(KEY, KEY_2);
    expect(await bucket.get(KEY)).toEqual(undefined);
    expect(await bucket.get(KEY_2)).toEqual(undefined);
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
