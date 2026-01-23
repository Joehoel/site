import { getAllNotes } from "@/data/post";
import { siteConfig } from "@/site.config";
import rss from "@astrojs/rss";

export const GET = async () => {
	const notes = await getAllNotes();

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: import.meta.env.SITE,
		items: notes.map((note) => ({
			title: note.title,
			pubDate: new Date(note.publishDate),
			link: `notes/${note.slug}/`,
		})),
	});
};
