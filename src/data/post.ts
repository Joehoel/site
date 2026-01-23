import {
	type Note,
	type Page,
	type Post,
	getNote,
	getPage,
	getPost,
	reader,
} from "@/utils/keystatic";

// Re-export types and single-item getters
export type { Post, Page, Note };
export type { PostWithContent, PageWithContent, NoteWithContent } from "@/utils/keystatic";
export { getPost, getPage, getNote };

/** Get all posts, filtering out drafts in production */
export async function getAllPosts(): Promise<Post[]> {
	const posts = await reader.collections.posts.all();

	return posts
		.filter((p) => (import.meta.env.PROD ? !p.entry.draft : true))
		.map((p) => ({ ...p.entry, slug: p.slug }))
		.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
}

/** Get all pages */
export async function getAllPages(): Promise<Page[]> {
	const pages = await reader.collections.page.all();
	return pages.map((p) => ({ ...p.entry, slug: p.slug }));
}

/** Get all notes, sorted by publish date */
export async function getAllNotes(): Promise<Note[]> {
	const notes = await reader.collections.notes.all();
	return notes
		.map((n) => ({ ...n.entry, slug: n.slug }))
		.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
}

/** Groups posts by year using publishDate */
export function groupPostsByYear(posts: Post[]) {
	return posts.reduce<Record<string, Post[]>>((acc, post) => {
		const publishDate = new Date(post.publishDate);
		const year = publishDate.getFullYear();

		if (!acc[year]) {
			acc[year] = [];
		}
		acc[year]?.push(post);
		return acc;
	}, {});
}

/** Returns all tags from posts (including duplicates) */
export function getAllTags(posts: Post[]) {
	return posts.flatMap((post) => [...(post.tags ?? [])]);
}

/** Returns all unique tags from posts */
export function getUniqueTags(posts: Post[]) {
	return [...new Set(getAllTags(posts))];
}

/** Returns a count of each unique tag - [[tagName, count], ...] */
export function getUniqueTagsWithCount(posts: Post[]): [string, number][] {
	return [
		...getAllTags(posts).reduce(
			(acc, t) => acc.set(t, (acc.get(t) ?? 0) + 1),
			new Map<string, number>(),
		),
	].sort((a, b) => b[1] - a[1]);
}
