import { Feed } from "feed";

export default defineEventHandler(async (event) => {
	const config = useAppConfig();
	const siteUrl = getRequestURL(event).origin;

	const feed = new Feed({
		title: `${config.site.title} - Notes`,
		description: `Quick notes and TILs from ${config.site.author}`,
		id: `${siteUrl}/notes`,
		link: `${siteUrl}/notes`,
		language: config.site.lang,
		copyright: `All rights reserved ${new Date().getFullYear()}, ${config.site.author}`,
		feedLinks: {
			rss: `${siteUrl}/notes/rss.xml`,
		},
		author: {
			name: config.site.author,
			link: siteUrl,
		},
	});

	const notes = await queryCollection(event, "notes").order("publishDate", "DESC").all();

	for (const note of notes) {
		feed.addItem({
			title: note.title,
			id: `${siteUrl}${note.path}`,
			link: `${siteUrl}${note.path}`,
			description: note.description,
			date: new Date(note.publishDate),
			author: [{ name: config.site.author, link: siteUrl }],
		});
	}

	setHeader(event, "content-type", "application/xml");
	return feed.rss2();
});
