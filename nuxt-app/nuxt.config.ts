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

	colorMode: {
		classSuffix: "",
		dataValue: "theme",
		preference: "system",
		fallback: "light",
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
		},
	},
});
