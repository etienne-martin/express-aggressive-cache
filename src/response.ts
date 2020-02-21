import { CachedResponse, Chunk, ExtendedResponse, Store } from "./types";
import { normalizeSetCookieHeaders } from "./utils/cookie";

export const returnCachedResponse = async (
  res: ExtendedResponse,
  cachedResponse: CachedResponse,
  chunkBucket: Store<Chunk>
) => {
  const setCookie = normalizeSetCookieHeaders(
    cachedResponse.headers["set-cookie"]
  );

  res.status(cachedResponse.statusCode);
  res.set(cachedResponse.headers);

  /**
   * Merge cached cookies and upstream cookies
   */
  if (setCookie && res.aggressiveCache?.upstreamCookies) {
    res.setHeader("set-cookie", [
      ...setCookie,
      ...res.aggressiveCache?.upstreamCookies
    ]);
  }

  res.setHeader("X-Cache", "HIT");

  for (const chunkId of cachedResponse.chunks) {
    const chunk = await chunkBucket.get(chunkId);

    if (chunk === undefined) throw new Error(`missing chunk: ${chunkId}`);

    res.write(chunk);
  }

  res.end();
};
