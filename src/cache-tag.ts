import { GetCacheTag } from "./";

export const akamaiGetCacheTag: GetCacheTag = ({ res }) => {
  const header = res.getHeader("Edge-Cache-Tag");
  return header ? String(header) : undefined;
};
