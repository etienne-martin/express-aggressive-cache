import { sharedTests } from "./test.shared";
import { defaultCache as cache } from "./server";
import { storeSharedTests } from "./test.store.shared";
import { memoryStore } from "..";

sharedTests("default", cache.purge);
storeSharedTests(memoryStore());
