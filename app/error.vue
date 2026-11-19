<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{ error: NuxtError }>();

const notFound = computed(() => props.error.statusCode === 404);

useHead({ title: notFound.value ? "Not found" : "Error" });
useSeoMeta({ robots: "noindex" });
</script>

<template>
  <NuxtLayout>
    <div class="pb-24">
      <SpecHero
        :eyebrow="`Error ${error.statusCode}`"
        :title="notFound ? 'Page not found' : 'Something went wrong'"
      >
        <p>
          {{
            notFound
              ? "This page doesn't exist (anymore). It may have moved, or the link is wrong."
              : "An unexpected error occurred. Try again in a moment."
          }}
        </p>
      </SpecHero>

      <button
        type="button"
        class="group mt-12 inline-flex items-center gap-x-2 font-label text-[0.6875rem] uppercase tracking-[0.2em] text-highlighted"
        @click="clearError({ redirect: '/' })"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="size-3.5 transition-transform group-hover:-translate-x-1"
        />
        Back home
      </button>
    </div>
  </NuxtLayout>
</template>
