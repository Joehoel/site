<script setup lang="ts">
import { orderRoles, selectCurrent } from "#shared/career";
import { currentRoleSentence } from "#shared/home";
import { formatWorkPeriod } from "#shared/work-history";

const appConfig = useAppConfig();

const MAX_PROJECTS = 5;
const MAX_POSTS = 4;
const MAX_NOTES = 3;

const { data: intro } = await useAsyncData("home-intro", async () => {
  const [home, career] = await Promise.all([
    queryCollection("home").first(),
    queryCollection("career").first(),
  ]);
  return { home, career, asOf: new Date().toISOString().slice(0, 10) };
});

if (!intro.value?.home) {
  throw createError({ statusCode: 404, message: "Home not found" });
}

const home = computed(() => intro.value!.home!);
const orderedRoles = computed(() => orderRoles(intro.value!.career ?? { roles: [] }));
const currentSelection = computed(() =>
  selectCurrent(intro.value!.career ?? { roles: [] }, intro.value!.asOf),
);

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

usePageSeo(
  computed(() => ({
    title: appConfig.site.title,
    description: `${currentRoleSentence(currentSelection.value, home.value)} ${home.value.description}`,
  })),
);
</script>

<template>
  <div class="flex flex-col gap-y-32">
    <!-- Hero -->
    <section>
      <h1
        class="mb-10 font-headline text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-highlighted md:text-7xl"
      >
        {{ home.title }}
      </h1>
      <ContentRenderer
        :value="home"
        :data="{ currentSelection }"
        :prose="false"
        class="home-intro"
      />

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

    <section v-if="projects?.length" aria-labelledby="projects">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <!-- Left rail: section heading -->
        <div class="lg:col-span-4">
          <div class="lg:sticky lg:top-28">
            <h2
              id="projects"
              class="mb-6 font-headline text-3xl font-bold tracking-tight text-highlighted md:text-4xl"
            >
              Projects
            </h2>
          </div>
        </div>
        <!-- Project list -->
        <div class="flex flex-col divide-y divide-outline-variant lg:col-span-8">
          <ProjectListItem
            v-for="(project, i) in projects"
            :key="project.path"
            :project="project"
            :index="i + 1"
          />
        </div>
      </div>
    </section>

    <section v-if="home.showWorkHistory && orderedRoles.length" aria-labelledby="work">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <div class="lg:sticky lg:top-28">
            <h2
              id="work"
              class="mb-6 font-headline text-3xl font-bold tracking-tight text-highlighted md:text-4xl"
            >
              Work
            </h2>
          </div>
        </div>
        <ol class="min-w-0 divide-y divide-outline-variant lg:col-span-8" role="list">
          <li v-for="role in orderedRoles" :key="role.id" class="py-6 wrap-anywhere first:pt-0">
            <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h3 class="font-headline text-xl font-semibold text-highlighted">
                {{ role.title }}
              </h3>
              <p class="font-label text-xs text-outline">
                {{ formatWorkPeriod(role, intro!.asOf) }}
              </p>
            </div>
            <p class="mt-2 font-body text-sm text-muted">{{ role.employer.name }}</p>
            <p v-if="role.summary" class="mt-3 font-body text-sm leading-relaxed text-muted">
              {{ role.summary }}
            </p>
          </li>
        </ol>
      </div>
    </section>

    <section v-if="posts?.length" aria-labelledby="log">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <!-- Left rail -->
        <div class="lg:col-span-4">
          <div class="lg:sticky lg:top-28">
            <h2
              id="log"
              class="mb-6 font-headline text-3xl font-bold tracking-tight text-highlighted md:text-4xl"
            >
              Log
            </h2>
            <p class="mb-8 max-w-xs font-body text-sm leading-relaxed text-muted">
              Articles about what I've built and learned.
            </p>
            <NuxtLink
              class="group inline-flex items-center gap-x-2 font-label text-[0.6875rem] uppercase tracking-[0.2em] text-highlighted"
              to="/log"
            >
              View Log
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
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <!-- Left rail: section heading -->
        <div class="lg:col-span-4">
          <div class="lg:sticky lg:top-28">
            <h2
              id="notes"
              class="mb-6 font-headline text-3xl font-bold tracking-tight text-highlighted md:text-4xl"
            >
              Notes
            </h2>
            <p class="mb-8 max-w-xs font-body text-sm leading-relaxed text-muted">
              Code and configuration I want to keep handy.
            </p>
            <NuxtLink
              class="group inline-flex items-center gap-x-2 font-label text-[0.6875rem] uppercase tracking-[0.2em] text-highlighted"
              to="/notes"
            >
              View Notes
              <UIcon
                name="i-lucide-arrow-right"
                class="size-3.5 transition-transform group-hover:translate-x-1"
              />
            </NuxtLink>
          </div>
        </div>
        <!-- Note list -->
        <ul class="flex flex-col divide-y divide-outline-variant lg:col-span-8" role="list">
          <li v-for="note in notes" :key="note.path" class="py-10 first:pt-0">
            <NoteCard :note="note" is-preview heading-level="h3" />
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.home-intro :deep(p) {
  @apply mb-10 max-w-2xl font-body text-lg leading-relaxed text-muted md:text-xl;
}
</style>
