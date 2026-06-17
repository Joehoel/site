<script setup lang="ts">
defineProps<{
  /** Optional eyebrow label (e.g. "Architect's Note"). Rendered `// LABEL`. */
  label?: string;
}>();
</script>

<template>
  <!--
    Pull-quote / "Architect's Note". Asymmetric: a solid primary bar on the
    left, generous left padding, Space Grotesk italic. No box, no border —
    hierarchy is earned through the accent rule and type, per the brief.
  -->
  <aside class="not-prose relative my-12 py-2 pl-12">
    <span aria-hidden="true" class="absolute inset-y-0 left-0 w-1 bg-primary" />
    <Eyebrow v-if="label" :label="label" class="mb-4" />
    <div
      class="font-headline text-lg italic leading-relaxed text-highlighted [&_p]:m-0 [&_p+p]:mt-4"
    >
      <slot />
    </div>
  </aside>
</template>
