<script setup lang="ts">
const appConfig = useAppConfig();
const year = new Date().getFullYear();

const footerLinks = [
  ...appConfig.socials.map((s) => ({ label: s.label, url: s.url })),
  { label: "RSS", url: "/rss.xml" },
];
</script>

<template>
  <footer class="mt-24 w-full border-t border-outline-variant">
    <div
      class="mx-auto flex max-w-3xl flex-col gap-y-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8"
    >
      <p class="font-label text-[0.625rem] uppercase tracking-[0.2em] text-outline">
        &copy; {{ year }} {{ appConfig.site.author }}. Built for precision.
      </p>
      <nav aria-label="More on this site" class="flex gap-x-8">
        <NuxtLink
          v-for="link in footerLinks"
          :key="link.url"
          :to="link.url"
          class="font-label text-[0.625rem] uppercase tracking-[0.2em] text-outline transition-colors hover:text-highlighted"
          :external="link.url.startsWith('http') || link.url.endsWith('.xml')"
          :target="link.url.startsWith('http') ? '_blank' : undefined"
          :rel="link.url.startsWith('http') ? 'noopener noreferrer' : undefined"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
footer {
  view-transition-name: footer;
}
</style>
