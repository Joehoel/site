export default defineAppConfig({
  ui: {
    // Monochrome: primary = white, neutral = Atelier greys.
    // The actual hex values live in main.css (--ui-color-*); these names just
    // tell Nuxt UI which scales to wire its semantic aliases to.
    colors: {
      primary: "primary",
      neutral: "neutral",
    },
  },

  site: {
    title: "Joël Kuijper",
    author: "Joël Kuijper",
    description: "I write about what I build and learn.",
    lang: "en",
    ogLocale: "en_GB",
  },

  navigation: [
    { label: "Home", url: "/" },
    { label: "Log", url: "/log" },
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
    locale: "en-GB",
    options: {
      day: "numeric",
      month: "short",
      year: "numeric",
    } satisfies Intl.DateTimeFormatOptions,
  },
});
