import { CachedResponse, Chunk, ExtendedResponse, Store } from "./types";

export const returnCachedResponse = async (
  res: ExtendedResponse,
  cachedResponse: CachedResponse,
  chunkBucket: Store<Chunk>
) => {
  res.status(cachedResponse.statusCode);
  res.set(cachedResponse.headers);
  res.setHeader("X-Cache", "HIT");

  for (const chunkId of cachedResponse.chunks) {
    const chunk = await chunkBucket.get(chunkId);

    if (chunk === undefined) throw new Error(`missing chunk: ${chunkId}`);

    res.write(chunk);
  }

  res.end();
};
