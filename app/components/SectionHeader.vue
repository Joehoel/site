<script setup lang="ts">
defineProps<{
  /** Eyebrow label (rendered as `// LABEL`). */
  eyebrow?: string;
  /** Heading text — used when no `title` slot is provided. */
  title?: string;
  /** Heading element tag. Defaults to `h2`. */
  as?: string;
}>();
</script>

<template>
  <div class="flex flex-col gap-4">
    <Eyebrow v-if="eyebrow" :label="eyebrow" />
    <component
      :is="as ?? 'h2'"
      class="font-headline text-2xl font-bold tracking-tight text-highlighted"
    >
      <slot name="title">{{ title }}</slot>
    </component>
    <div v-if="$slots.default" class="font-body text-base leading-relaxed text-muted">
      <slot />
    </div>
  </div>
</template>
