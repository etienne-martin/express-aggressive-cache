import { Store } from "../types";

export const storeSharedTests = (store: <T>() => Store<T>) => {
  const bucket = store<string>();
  test("store del should delete entries", async () => {
    const KEY_1 = "key1";
    const KEY_2 = "key2";
    await bucket.set(KEY_1, "value1");
    await bucket.set(KEY_2, "value2");
    await bucket.del(KEY_1, KEY_2);
    expect(await bucket.get(KEY_1)).toEqual(undefined);
    expect(await bucket.get(KEY_2)).toEqual(undefined);
  });

  test("store set and get should return value", async () => {
    const KEY = "key";
    const VALUE = "value";
    await bucket.set(KEY, "value");
    expect(await bucket.get(KEY)).toEqual(VALUE);
  });
};
