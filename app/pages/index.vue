<script setup lang="ts">
const appConfig = useAppConfig();

const MAX_PROJECTS = 5;
const MAX_POSTS = 4;
const MAX_NOTES = 3;

const { data: projects } = await useAsyncData("home-projects", () =>
  queryCollection("projects")
    .where("draft", "=", false)
    .order("order", "ASC")
    .limit(MAX_PROJECTS)
    .all(),
);

const { data: posts } = await useAsyncData("latest-posts", () =>
  queryCollection("posts")
    .where("draft", "=", false)
    .order("publishDate", "DESC")
    .limit(MAX_POSTS)
    .all(),
);

const { data: notes } = await useAsyncData("latest-notes", () =>
  queryCollection("notes")
    .where("draft", "=", false)
    .order("publishDate", "DESC")
    .limit(MAX_NOTES)
    .all(),
);

useSeoMeta({
  title: "Home",
  description: appConfig.site.description,
});
</script>

<template>
  <div class="flex flex-col gap-y-32">
    <!-- Hero -->
    <section>
      <Eyebrow class="mb-6" label="STATUS: AVAILABLE_FOR_WORK" />
      <h1
        class="mb-10 font-headline text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-highlighted md:text-7xl"
      >
        Fullstack developer
        <br />
        building robust
        <br />
        digital infrastructure.
      </h1>
      <p class="mb-10 max-w-2xl font-body text-lg leading-relaxed text-muted md:text-xl">
        Hi, I'm Joël Kuijper — a fullstack developer from the Netherlands, currently at
        <a
          class="text-highlighted underline decoration-outline-variant underline-offset-4 transition-colors hover:decoration-highlighted"
          href="https://www.deindruk.nl"
          target="_blank"
          rel="noreferrer"
          >De Indruk</a
        >. This is where I write about the things I make and learn.
      </p>

      <!-- Repositioned social links -->
      <ul class="flex items-center gap-x-6" role="list">
        <li v-for="social in appConfig.socials" :key="social.url">
          <a
            class="inline-flex items-center gap-x-2 font-label text-[0.6875rem] uppercase tracking-[0.1em] text-outline transition-colors hover:text-highlighted"
            :href="social.url"
            rel="noreferrer"
            target="_blank"
          >
            <Icon :name="social.icon" aria-hidden="true" class="size-4" focusable="false" />
            {{ social.label }}
          </a>
        </li>
        <li>
          <NuxtLink
            class="inline-flex items-center gap-x-2 font-label text-[0.6875rem] uppercase tracking-[0.1em] text-outline transition-colors hover:text-highlighted"
            to="/uses"
          >
            <UIcon name="i-lucide-wrench" aria-hidden="true" class="size-4" />
            Uses
          </NuxtLink>
        </li>
      </ul>
    </section>

    <!-- Selected Works -->
    <section v-if="projects?.length" aria-labelledby="selected-works">
      <div class="mb-8 flex items-baseline justify-between border-b border-outline-variant pb-4">
        <SectionHeader id="selected-works" eyebrow="PROJECTS" title="Selected Works" />
        <span class="font-label text-[0.6875rem] uppercase tracking-[0.1em] text-outline">
          {{ String(projects.length).padStart(2, "0") }} ENTRIES
        </span>
      </div>
      <div class="flex flex-col divide-y divide-outline-variant">
        <ProjectListItem
          v-for="(project, i) in projects"
          :key="project.path"
          :project="project"
          :index="i + 1"
        />
      </div>
    </section>

    <!-- Technical Log -->
    <section v-if="posts?.length" aria-labelledby="technical-log">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <!-- Left rail -->
        <div class="lg:col-span-4">
          <div class="lg:sticky lg:top-28">
            <Eyebrow class="mb-4" label="RESEARCH_DEEP_DIVES" />
            <h2
              id="technical-log"
              class="mb-6 font-headline text-3xl font-bold tracking-tight text-highlighted md:text-4xl"
            >
              Technical Log
            </h2>
            <p class="mb-8 max-w-xs font-body text-sm leading-relaxed text-muted">
              A chronicle of systems engineering, architectural decisions, and the pursuit of
              performant software.
            </p>
            <NuxtLink
              class="group inline-flex items-center gap-x-2 font-label text-[0.6875rem] uppercase tracking-[0.2em] text-highlighted"
              to="/posts"
            >
              VIEW_ALL_LOGS
              <UIcon
                name="i-lucide-arrow-right"
                class="size-3.5 transition-transform group-hover:translate-x-1"
              />
            </NuxtLink>
          </div>
        </div>

        <!-- Post list -->
        <div class="flex flex-col divide-y divide-outline-variant lg:col-span-8">
          <BlogPostListItem v-for="post in posts" :key="post.path" :post="post" />
        </div>
      </div>
    </section>

    <!-- Notes -->
    <section v-if="notes?.length" aria-labelledby="notes">
      <div class="mb-8 flex items-baseline justify-between border-b border-outline-variant pb-4">
        <SectionHeader id="notes" eyebrow="STREAM" title="Notes" />
        <NuxtLink
          class="group inline-flex items-center gap-x-2 font-label text-[0.6875rem] uppercase tracking-[0.2em] text-highlighted"
          to="/notes"
        >
          VIEW_ALL_NOTES
          <UIcon
            name="i-lucide-arrow-right"
            class="size-3.5 transition-transform group-hover:translate-x-1"
          />
        </NuxtLink>
      </div>
      <ul class="flex flex-col divide-y divide-outline-variant" role="list">
        <li v-for="note in notes" :key="note.path" class="py-10 first:pt-0">
          <NoteCard :note="note" is-preview heading-level="h3" />
        </li>
      </ul>
    </section>
  </div>
</template>
