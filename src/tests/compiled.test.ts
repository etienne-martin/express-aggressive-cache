import { sharedTests } from "./test.shared";
import { compiledCache as cache } from "./server";

sharedTests("compiled", cache.purge);
