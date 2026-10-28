import { getCollection } from "astro:content";

export const POSTS_PER_PAGE = 5;

export async function getSortedPosts() {
  return (await getCollection("posts")).sort((a, b) => b.id.localeCompare(a.id));
}
