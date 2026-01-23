import type { BundledLanguage } from "shiki";

const highlightLangs: BundledLanguage[] = [
	"python",
	"tsx",
	"toml",
	"dotenv",
	"ini",
];

const highlightOptions = {
	theme: {
		default: "github-light",
		light: "github-light",
		dark: "github-dark",
	},
	langs: highlightLangs,
	compress: false,
};

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },

	future: {
		compatibilityVersion: 4,
	},

	experimental: {
		viewTransition: true,
	},

	modules: [
		"@nuxt/content",
		"@nuxt/ui",
		"@nuxt/image",
		"@nuxtjs/sitemap",
		"@nuxtjs/color-mode",
		"nuxt-studio",
	],

	studio: {
		route: "/admin",
		repository: {
			provider: "github",
			owner: "Joehoel",
			repo: "site",
			branch: "master",
		},
	},

	css: ["~/assets/css/main.css"],

	content: {
		build: {
			markdown: {
				highlight: highlightOptions,
			},
		},
	},

	colorMode: {
		classSuffix: "",
		preference: "system",
		fallback: "light",
	},

	site: {
		url: "https://joelkuijper.me",
	},

	routeRules: {
		"/admin/**": { ssr: true },
		"/__nuxt_studio/**": { ssr: true },
		"/**": { prerender: true },
	},

	nitro: {
		preset: "vercel",
		prerender: {
			// Don't fail on 404s - some content may link to draft posts
			failOnError: false,
		},
	},

	image: {
		provider: "ipx",
	},

	app: {
		head: {
			htmlAttrs: { lang: "nl" },
			meta: [
				{ charset: "utf-8" },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
			],
			link: [
				{ rel: "icon", type: "image/svg+xml", href: "/icon.svg" },
				{
					rel: "alternate",
					type: "application/rss+xml",
					title: "RSS Feed",
					href: "/rss.xml",
				},
				{
					rel: "alternate",
					type: "application/rss+xml",
					title: "Notes RSS Feed",
					href: "/notes/rss.xml",
				},
			],
		},
	},
});
