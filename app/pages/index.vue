<script setup lang="ts">
const appConfig = useAppConfig();

const MAX_POSTS = 10;
const MAX_NOTES = 5;

const { data: posts } = await useAsyncData("latest-posts", () =>
  queryCollection("posts")
    .where("draft", "=", false)
    .order("publishDate", "DESC")
    .limit(MAX_POSTS)
    .all(),
);

const { data: notes } = await useAsyncData("latest-notes", () =>
  queryCollection("notes").order("publishDate", "DESC").limit(MAX_NOTES).all(),
);

useSeoMeta({
  title: "Home",
  description: appConfig.site.description,
});
</script>

<template>
  <section>
    <h1 class="title mb-6">Hello World!</h1>
    <p class="mb-4">
      Hi, I'm Joel Kuijper, a fullstack developer from the Netherlands. I'm currently working at
      <a
        href="https://www.deindruk.nl"
        class="text-accent underline-offset-2 sm:hover:underline"
        target="_blank"
        rel="noreferrer"
        >De Indruk</a
      >
      as a Full-Stack Developer.
    </p>
    <p class="mb-4">
      This website is a place for me to write about stuff I make and learn about. If you are curious
      about the tools and apps I use, you can find a list of my favorites
      <a href="/uses/" class="text-accent underline-offset-2 sm:hover:underline">here</a>.
    </p>
    <!-- Social Links -->
    <div class="flex flex-wrap items-end gap-x-2">
      <p>Find me on</p>
      <ul class="flex flex-1 items-center gap-x-2 sm:flex-initial">
        <li v-for="social in appConfig.socials" :key="social.url" class="flex">
          <a
            class="inline-block sm:hover:text-link"
            :href="social.url"
            rel="noreferrer"
            target="_blank"
          >
            <Icon :name="social.icon" aria-hidden="true" class="h-8 w-8" focusable="false" />
            <span class="sr-only">{{ social.label }}</span>
          </a>
        </li>
      </ul>
    </div>
  </section>

  <section aria-label="Blog post list" class="mt-16">
    <h2 class="title mb-6 text-xl text-accent">
      <NuxtLink to="/posts">Posts</NuxtLink>
    </h2>
    <ul class="space-y-4" role="list">
      <li v-for="post in posts" :key="post.path" class="grid gap-2 sm:grid-cols-[auto_1fr]">
        <BlogPostPreview :post="post" />
      </li>
    </ul>
  </section>

  <section v-if="notes?.length" class="mt-16">
    <h2 class="title mb-6 text-xl text-accent">
      <NuxtLink to="/notes">Notes</NuxtLink>
    </h2>
    <ul class="space-y-4" role="list">
      <li v-for="note in notes" :key="note.path">
        <NoteCard :note="note" is-preview heading-level="h3" />
      </li>
    </ul>
  </section>
</template>
