<script setup lang="ts">
defineProps<{
  /** Label text; the `// ` prefix is added automatically. */
  label: string;
  /** Render as a different element (e.g. `span` inline). Defaults to `span` block. */
  as?: string;
}>();
</script>

<template>
  <component
    :is="as ?? 'span'"
    class="block font-label text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-outline"
  >
    <span aria-hidden="true" class="select-none">//&nbsp;</span>{{ label }}
  </component>
</template>
