<script setup lang="ts">
const { data: notes } = await useAsyncData("all-notes", () =>
  queryCollection("notes").where("draft", "=", false).order("publishDate", "DESC").all(),
);

useSeoMeta({
  title: "Notes",
  description: "Read my collection of notes",
});
</script>

<template>
  <div>
    <!-- Hero header -->
    <header class="mb-16 grid grid-cols-1 gap-8 md:grid-cols-12">
      <div class="md:col-span-8">
        <Eyebrow class="mb-4" label="FIELD_NOTES" />
        <h1
          class="font-headline text-5xl font-bold leading-[1.05] tracking-[-0.04em] text-highlighted md:text-6xl"
        >
          Notes &amp; snippets.
        </h1>
      </div>
      <div class="flex items-start md:col-span-4 md:items-end md:justify-end">
        <p class="max-w-xs font-body text-sm leading-relaxed text-muted md:text-right">
          Short, code-first jottings — patterns, configs and things worth remembering.
          <a
            class="ml-1 inline-flex align-middle text-outline transition-colors hover:text-highlighted"
            href="/notes/rss.xml"
            target="_blank"
          >
            <span class="sr-only">RSS feed</span>
            <UIcon aria-hidden="true" class="size-4" name="i-mdi-rss" />
          </a>
        </p>
      </div>
    </header>

    <!-- Note list -->
    <div class="flex flex-col divide-y divide-outline-variant">
      <div v-for="note in notes" :key="note.path" class="py-12 first:pt-0 last:pb-0">
        <NoteCard :note="note" heading-level="h2" is-preview />
      </div>
    </div>

    <p v-if="!notes?.length" class="py-16 text-center font-body text-sm text-muted">
      No notes yet.
    </p>
  </div>
</template>
