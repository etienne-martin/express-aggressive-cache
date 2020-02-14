import { Response } from "express";
import { CachedResponse, Chunk, Store } from "./types";

export const returnCachedResponse = async (
  res: Response,
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
