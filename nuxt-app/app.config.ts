export default defineAppConfig({
	site: {
		title: "Joel",
		author: "Joel Kuijper",
		description: "Personal website of Joel Kuijper",
		lang: "nl-NL",
		ogLocale: "nl_NL",
	},

	navigation: [
		{ label: "Home", url: "/" },
		{ label: "Blog", url: "/posts" },
		{ label: "Notes", url: "/notes" },
		{ label: "Uses", url: "/uses" },
	],

	socials: [
		{ label: "GitHub", url: "https://github.com/joehoel", icon: "mdi:github" },
		{
			label: "LinkedIn",
			url: "https://www.linkedin.com/in/jo%C3%ABl-kuijper/",
			icon: "mdi:linkedin",
		},
	],

	date: {
		locale: "nl-NL",
		options: {
			day: "numeric",
			month: "short",
			year: "numeric",
		} as Intl.DateTimeFormatOptions,
	},
});
