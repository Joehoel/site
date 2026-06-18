<script setup lang="ts">
import type { ProjectsCollectionItem } from "@nuxt/content";

const props = defineProps<{
  project: ProjectsCollectionItem;
  /** Sequential entry number (e.g. 1 → rendered as `01`). */
  index: number;
}>();

// External `link` wins; otherwise fall back to the project's own page.
const href = computed(() => props.project.link ?? props.project.path);
const isExternal = computed(() => Boolean(props.project.link?.startsWith("http")));

const entryNo = computed(() => String(props.index).padStart(2, "0"));
</script>

<template>
  <NuxtLink
    :to="href"
    :external="isExternal"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
    class="group -mx-4 grid grid-cols-1 items-center gap-y-4 px-4 py-10 transition-colors duration-300 hover:bg-surface-container-low sm:px-6 md:grid-cols-12 md:gap-x-8 md:py-12"
  >
    <!-- Entry № -->
    <span
      class="hidden font-label text-[0.6875rem] uppercase tracking-[0.1em] text-outline md:col-span-1 md:block"
    >
      {{ entryNo }}
    </span>

    <!-- Title -->
    <h3
      class="font-headline text-2xl text-highlighted transition-transform duration-300 group-hover:translate-x-2 md:col-span-5 md:text-3xl"
    >
      {{ project.title }}
    </h3>

    <!-- Tech chips -->
    <div v-if="project.techStack?.length" class="flex flex-wrap gap-2 md:col-span-4">
      <Tag v-for="tech in project.techStack" :key="tech" :label="tech" />
    </div>
    <div v-else class="md:col-span-4" />

    <!-- Affordance arrow -->
    <div class="hidden text-right md:col-span-2 md:block">
      <UIcon
        name="i-lucide-arrow-up-right"
        class="inline-block size-5 text-outline-variant transition-colors group-hover:text-highlighted"
      />
    </div>
  </NuxtLink>
</template>
