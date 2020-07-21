import { GetCacheTag } from "../";

// This function body is copied in the README
export const akamaiGetCacheTag: GetCacheTag = ({ res }) => {
  const header = res.getHeader("Edge-Cache-Tag");

  return header ? String(header) : undefined;
};
