<script setup lang="ts">
defineProps<{
  /** Eyebrow label (rendered `// LABEL`). */
  eyebrow?: string;
  /** Display headline. */
  title: string;
}>();
</script>

<template>
  <!-- Page hero: asymmetric display headline (left) + lede (right). -->
  <header class="grid grid-cols-1 gap-8 md:grid-cols-12">
    <div class="md:col-span-8">
      <Eyebrow v-if="eyebrow" :label="eyebrow" class="mb-4" />
      <h1
        class="font-headline text-5xl font-bold leading-[1.05] tracking-[-0.04em] text-highlighted md:text-7xl"
      >
        {{ title }}
      </h1>
    </div>
    <div
      v-if="$slots.default"
      class="flex flex-col justify-end font-body text-sm leading-relaxed text-on-surface-variant md:col-span-4 [&_p]:m-0"
    >
      <slot />
    </div>
  </header>
</template>
