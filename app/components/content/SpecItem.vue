<script setup lang="ts">
defineProps<{
  /** Micro-label / role (e.g. "PRIMARY_MACHINE"). Rendered uppercase. */
  label?: string;
  /** Hardware name — the row heading. */
  name: string;
  /** Optional status badge (e.g. "In Use"), rendered as a UBadge. */
  status?: string;
  /** Optional project icon (image path), shown before the label. */
  icon?: string;
  /** Optional link (e.g. the repo) for the icon + label. */
  href?: string;
}>();
</script>

<template>
  <!--
    Hardware row. Tonal layering (surface-container-low → -container on hover),
    no border. Micro-label + name + description, with an optional status badge
    pinned to the right (UBadge, per the component-map — not UChip).
  -->
  <div
    class="group flex flex-col justify-between gap-4 bg-surface-container-low p-8 transition-colors duration-300 hover:bg-surface-container md:flex-row md:items-center"
  >
    <div class="flex flex-col">
      <component
        :is="href ? 'a' : 'span'"
        v-if="label || icon"
        :href="href"
        :target="href ? '_blank' : undefined"
        :rel="href ? 'noreferrer' : undefined"
        class="mb-2 inline-flex items-center gap-2 self-start font-label text-[0.6875rem] uppercase tracking-[0.2em] text-on-surface-variant"
        :class="{ 'transition-colors hover:text-highlighted': href }"
      >
        <img v-if="icon" :src="icon" alt="" width="20" height="20" class="size-5 shrink-0" />
        {{ label }}
      </component>
      <h3 class="font-headline text-lg text-highlighted">{{ name }}</h3>
      <div
        v-if="$slots.default"
        class="mt-1 font-body text-sm leading-relaxed text-on-surface-variant [&_a]:underline [&_a]:decoration-outline-variant [&_a]:underline-offset-2 [&_a:hover]:text-highlighted [&_a:hover]:decoration-outline [&_p]:m-0"
      >
        <slot />
      </div>
    </div>

    <UBadge
      v-if="status"
      :label="status"
      color="neutral"
      variant="solid"
      size="sm"
      :ui="{
        base: 'shrink-0 rounded-none bg-surface-container-highest font-label text-[0.65rem] uppercase tracking-[0.1em] text-on-surface-variant px-3 py-1',
      }"
    />
  </div>
</template>
