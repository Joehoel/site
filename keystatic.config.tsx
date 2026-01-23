// keystatic.config.ts
import { collection, config, fields, singleton } from "@keystatic/core";
import { inline } from "@keystatic/core/content-components";

export default config({
	storage:
		process.env.NODE_ENV === "production"
			? {
					kind: "github",
					repo: {
						owner: "joehoel",
						name: "site",
					},
				}
			: { kind: "local" },
	locale: "en-US",
	ui: {
		brand: {
			name: "Joel Kuijper",
		},
	},
	singletons: {
		socials: singleton({
			label: "Socials",
			entryLayout: "form",
			path: "content/socials",
			schema: {
				links: fields.array(
					fields.object({
						label: fields.text({ label: "Label", validation: { isRequired: true } }),
						url: fields.text({ label: "URL", validation: { isRequired: true } }),
						icon: fields.text({ label: "Icon", validation: { isRequired: true } }),
						isWebmention: fields.checkbox({ label: "Is Webmention", defaultValue: true }),
					}),
					{
						label: "Links",
						itemLabel: (props) =>
							`${props.fields.label.value} - ${decodeURIComponent(props.fields.url.value)}`,
					},
				),
			},
		}),
		navigation: singleton({
			label: "Navigation",
			entryLayout: "form",
			path: "content/navigation",
			schema: {
				links: fields.array(
					fields.object({
						label: fields.text({ label: "Label", validation: { isRequired: true } }),
						url: fields.text({ label: "URL", validation: { isRequired: true } }),
					}),
					{
						description: "Links to other pages on the site shown in the navigation",
						label: "Links",
						itemLabel: (props) =>
							`${props.fields.label.value} - ${decodeURIComponent(props.fields.url.value)}`,
						validation: {
							length: {
								min: 1,
							},
						},
					},
				),
			},
		}),
	},
	collections: {
		posts: collection({
			previewUrl: "/posts/{slug}",
			label: "Posts",
			slugField: "title",
			entryLayout: "content",
			path: "content/post/*",
			format: { contentField: "content" },
			columns: ["title", "description", "draft", "publishDate"],
			schema: {
				title: fields.slug({
					name: {
						label: "Title",
						validation: {
							length: {
								max: 60,
							},
						},
					},
				}),
				draft: fields.checkbox({
					label: "Draft",
					defaultValue: true,
					description: "If the post is a draft, it will not be published",
				}),
				description: fields.text({
					label: "Description",
					multiline: true,
					description: "Short description of the post describing the core content",
					validation: {
						isRequired: false,
					},
				}),
				tags: fields.array(fields.text({ label: "Tag" }), {
					label: "Tags",
					itemLabel: (props) => props.value,
				}),
				coverImage: fields.object(
					{
						src: fields.image({
							label: "Image",
							directory: "./public/images",
							publicPath: "/images",
						}),
						alt: fields.text({ label: "Alt Text" }),
					},
					{ label: "Cover Image" },
				),
				ogImage: fields.image({
					label: "OG Image",
					directory: "./public/og-image",
					publicPath: "/og-image",
				}),
				publishDate: fields.date({
					label: "Publish Date",
					defaultValue: { kind: "today" },
					description: "The date the post was (or will be) published",
					validation: { isRequired: true },
				}),
				updatedDate: fields.date({
					label: "Updated Date",
					defaultValue: { kind: "today" },
					description: "The date the post was last updated",
				}),
				content: fields.markdoc({
					label: "Content",
					options: {
						image: {
							directory: "./public/images",
							publicPath: "/images",
						},
					},
				}),
			},
		}),
		page: collection({
			label: "Pages",
			slugField: "title",
			path: "content/page/*",
			entryLayout: "content",
			format: { contentField: "content" },
			columns: ["title"],
			schema: {
				title: fields.slug({ name: { label: "Title" } }),
				ogImage: fields.image({
					label: "OG Image",
					directory: "./public/og-image",
					publicPath: "/og-image",
				}),
				publishDate: fields.date({
					label: "Publish Date",
					defaultValue: { kind: "today" },
					description: "The date the page was (or will be) published",
					validation: { isRequired: true },
				}),
				updatedDate: fields.date({
					label: "Updated Date",
					defaultValue: { kind: "today" },
					description: "The date the page was last updated",
				}),
				content: fields.markdoc({
					label: "Content",
					components: {
						Timestamp: inline({
							label: "Timestamp",
							schema: {
								date: fields.date({
									label: "Date",
									defaultValue: { kind: "today" },
								}),
							},
						}),
					},
				}),
			},
		}),
		notes: collection({
			label: "Notes",
			slugField: "title",
			path: "content/note/*",
			entryLayout: "content",
			format: { contentField: "content" },
			columns: ["title", "publishDate"],
			schema: {
				title: fields.slug({ name: { label: "Title" } }),
				description: fields.text({
					label: "Description",
					multiline: true,
					validation: { isRequired: false },
				}),
				publishDate: fields.datetime({
					label: "Publish Date",
					defaultValue: { kind: "now" },
					validation: { isRequired: true },
				}),
				content: fields.markdoc({
					label: "Content",
				}),
			},
		}),
	},
});
