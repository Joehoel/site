import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site.config";
import rss from "@astrojs/rss";

export const GET = async () => {
	const posts = await getAllPosts();

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: import.meta.env.SITE,
		items: posts.map((post) => ({
			title: post.title,
			description: post.description ?? undefined,
			pubDate: new Date(post.publishDate),
			link: `posts/${post.slug}/`,
		})),
	});
};
