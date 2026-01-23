import { type Entry, createReader } from "@keystatic/core/reader";
import Markdoc, { type RenderableTreeNode } from "@markdoc/markdoc";
import keystaticConfig from "~/keystatic.config";
import { markdocConfig } from "./markdoc-config";

// Create the Keystatic reader
export const reader = createReader(process.cwd(), keystaticConfig);

// Type exports derived from Keystatic config
export type Post = Entry<(typeof keystaticConfig)["collections"]["posts"]> & {
	slug: string;
};

export type Page = Entry<(typeof keystaticConfig)["collections"]["page"]> & {
	slug: string;
};

export type Note = Entry<(typeof keystaticConfig)["collections"]["notes"]> & {
	slug: string;
};

// Content with rendered Markdoc
export type PostWithContent = Post & {
	renderedContent: RenderableTreeNode;
};

export type PageWithContent = Page & {
	renderedContent: RenderableTreeNode;
};

export type NoteWithContent = Note & {
	renderedContent: RenderableTreeNode;
};

// Helper to transform Markdoc content
async function transformMarkdocContent(
	contentFn: () => Promise<{ node: import("@markdoc/markdoc").Node }>,
): Promise<RenderableTreeNode> {
	const { node } = await contentFn();
	const errors = Markdoc.validate(node, markdocConfig);
	if (errors.length) {
		console.error("Markdoc validation errors:", errors);
		throw new Error("Invalid Markdoc content");
	}
	return Markdoc.transform(node, markdocConfig);
}

// Get a single post with rendered content
export async function getPost(slug: string): Promise<PostWithContent | null> {
	const post = await reader.collections.posts.read(slug);
	if (!post) return null;

	const renderedContent = await transformMarkdocContent(post.content);

	return {
		...post,
		slug,
		renderedContent,
	};
}

// Get a single page with rendered content
export async function getPage(slug: string): Promise<PageWithContent | null> {
	const page = await reader.collections.page.read(slug);
	if (!page) return null;

	const renderedContent = await transformMarkdocContent(page.content);

	return {
		...page,
		slug,
		renderedContent,
	};
}

// Get a single note with rendered content
export async function getNote(slug: string): Promise<NoteWithContent | null> {
	const note = await reader.collections.notes.read(slug);
	if (!note) return null;

	const renderedContent = await transformMarkdocContent(note.content);

	return {
		...note,
		slug,
		renderedContent,
	};
}
