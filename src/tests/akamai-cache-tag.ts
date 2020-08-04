import { GetCacheTag } from "../";

// This function body is copied in the README
export const akamaiGetCacheTag: GetCacheTag = ({ res }): string | undefined => {
  return res.get("Edge-Cache-Tag");
};
