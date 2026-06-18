<script setup lang="ts">
defineProps<{
  /** Micro-label / role (e.g. "PRIMARY_MACHINE"). Rendered uppercase. */
  label?: string;
  /** Hardware name — the row heading. */
  name: string;
  /** Optional status badge (e.g. "In Use"), rendered as a UBadge. */
  status?: string;
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
      <span
        v-if="label"
        class="mb-1 font-label text-[0.6875rem] uppercase tracking-[0.2em] text-outline-variant"
      >
        {{ label }}
      </span>
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
