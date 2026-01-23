// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },

	modules: [
		"@nuxt/content",
		"@nuxtjs/tailwindcss",
		"@nuxt/image",
		"@nuxtjs/sitemap",
		"@nuxt/icon",
		"@nuxtjs/color-mode",
		"nuxt-studio",
	],

	css: ["~/assets/css/main.css"],

	colorMode: {
		classSuffix: "",
		dataValue: "theme",
		preference: "system",
		fallback: "light",
	},

	tailwindcss: {
		cssPath: false, // We're using our own CSS file
	},

	site: {
		url: "https://joelkuijper.me",
	},

	routeRules: {
		"/admin/**": { ssr: true },
		"/**": { prerender: true },
	},

	nitro: {
		preset: "vercel",
	},

	app: {
		head: {
			htmlAttrs: { lang: "nl" },
			meta: [
				{ charset: "utf-8" },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
			],
			link: [
				{ rel: "alternate", type: "application/rss+xml", title: "RSS Feed", href: "/rss.xml" },
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
