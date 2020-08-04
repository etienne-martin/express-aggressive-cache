import { Store } from "../types";

export const storeSharedTests = (store: <T>() => Store<T>) => {
  const bucket = store<string>();
  test("store del should delete entry", async () => {
    const KEY = "key";
    await bucket.set(KEY, "value");
    await bucket.del(KEY);
    expect(await bucket.get(KEY)).toEqual(undefined);
  });

  test("store set and get should return value", async () => {
    const KEY = "key";
    const VALUE = "value";
    await bucket.set(KEY, "value");
    expect(await bucket.get(KEY)).toEqual(VALUE);
  });
};
