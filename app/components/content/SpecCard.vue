<script setup lang="ts">
defineProps<{
  /** Iconify name (e.g. "i-lucide-code"). Defaults to a generic chip icon. */
  icon?: string;
  /** Category label (e.g. "Development"). Rendered uppercase. */
  category?: string;
  /** Software / tool name — the card heading. */
  name: string;
}>();
</script>

<template>
  <!--
    Software card. Tonal layering (surface-container-low → -container on hover),
    no border. Icon + category eyebrow, heading, then a `/`-prefixed bullet list
    fed from the slotted markdown <ul>.
  -->
  <div class="group bg-surface-container-low p-8 transition-colors hover:bg-surface-container">
    <div class="mb-6 flex items-center gap-3">
      <UIcon :name="icon ?? 'i-lucide-square'" class="size-5 text-highlighted" />
      <span
        v-if="category"
        class="font-label text-[0.6rem] uppercase tracking-[0.1em] text-outline"
      >
        {{ category }}
      </span>
    </div>

    <h3 class="mb-4 font-headline text-xl text-highlighted">{{ name }}</h3>

    <div
      class="spec-card-list font-body text-sm leading-relaxed text-on-surface-variant [&_a]:underline [&_a]:decoration-outline-variant [&_a]:underline-offset-2 [&_a:hover]:text-highlighted [&_a:hover]:decoration-outline"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.spec-card-list :deep(ul) {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.spec-card-list :deep(li) {
  position: relative;
  padding-left: 1.25rem;
}

.spec-card-list :deep(li)::before {
  content: "/";
  position: absolute;
  left: 0;
  top: 0;
  font-family: var(--font-mono, ui-monospace, monospace);
  color: var(--ui-text-highlighted);
}

.spec-card-list :deep(p) {
  margin: 0;
}
</style>
