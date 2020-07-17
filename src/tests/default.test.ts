import { sharedTests } from "./test.shared";
import { defaultCache as cache } from "./server";

sharedTests("default", cache.purge);
