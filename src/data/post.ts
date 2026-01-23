import { type CollectionEntry, getCollection } from "astro:content";

export type Post = CollectionEntry<"post">;
export type Page = CollectionEntry<"page">;
export type Note = CollectionEntry<"note">;

/** filter out draft posts based on the environment */
export async function getAllPosts(): Promise<Post[]> {
	const posts = await getCollection("post");

	return posts
		.filter((post) => (import.meta.env.PROD ? !post.data.draft : true))
		.sort(
			(a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime(),
		);
}

export async function getAllPages(): Promise<Page[]> {
	return await getCollection("page");
}

export async function getAllNotes(): Promise<Note[]> {
	const notes = await getCollection("note");
	return notes.sort(
		(a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime(),
	);
}

/** groups posts by year (based on publishDate), using the year as the key
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 */
export function groupPostsByYear(posts: Post[]) {
	return posts.reduce<Record<string, Post[]>>((acc, post) => {
		const publishDate = new Date(post.data.publishDate);
		const year = publishDate.getFullYear();

		if (!acc[year]) {
			acc[year] = [];
		}
		acc[year]?.push(post);
		return acc;
	}, {});
}

/** returns all tags created from posts (inc duplicate tags)
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getAllTags(posts: Post[]) {
	return posts.flatMap((post) => [...(post.data.tags ?? [])]);
}

/** returns all unique tags created from posts
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getUniqueTags(posts: Post[]) {
	return [...new Set(getAllTags(posts))];
}

/** returns a count of each unique tag - [[tagName, count], ...]
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getUniqueTagsWithCount(posts: Post[]): [string, number][] {
	return [
		...getAllTags(posts).reduce(
			(acc, t) => acc.set(t, (acc.get(t) ?? 0) + 1),
			new Map<string, number>(),
		),
	].sort((a, b) => b[1] - a[1]);
}
