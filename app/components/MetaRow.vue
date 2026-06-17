<script setup lang="ts">
defineProps<{
  /** Meta items rendered inline, separated by a hairline divider. Falsy items are skipped. */
  items?: (string | null | undefined)[];
  /** Stack vertically instead of inline (used in the left rail of a list item). */
  stacked?: boolean;
}>();
</script>

<template>
  <!-- Stacked: each item on its own line (e.g. date over № in a list rail). -->
  <div v-if="stacked" class="flex flex-col gap-1">
    <template v-for="(item, i) in items" :key="i">
      <span
        v-if="item"
        class="font-label text-[0.6875rem] uppercase tracking-[0.1em] text-on-surface-variant"
      >
        {{ item }}
      </span>
    </template>
    <slot />
  </div>

  <!-- Inline: items joined by a hairline divider (DATE — CATEGORY). -->
  <div v-else class="flex flex-wrap items-center gap-x-3 gap-y-1">
    <template v-for="(item, i) in (items ?? []).filter(Boolean)" :key="i">
      <span aria-hidden="true" :class="i === 0 ? 'hidden' : 'h-px w-6 bg-outline-variant'" />
      <span class="font-label text-[0.6875rem] uppercase tracking-[0.1em] text-on-surface-variant">
        {{ item }}
      </span>
    </template>
    <slot />
  </div>
</template>
