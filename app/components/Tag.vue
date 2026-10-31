<script setup lang="ts">
defineProps<{
  /** Tag / topic label. Rendered uppercase. */
  label: string;
  /** Optional link target. */
  to?: string;
  /** Accessible title / tooltip for the badge. */
  title?: string;
}>();
</script>

<template>
  <NuxtLink v-if="to" :to="to" :title="title" class="inline-flex">
    <UBadge
      :label="label"
      color="neutral"
      variant="outline"
      size="sm"
      :ui="{
        base: 'rounded-none font-label text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-on-surface-variant bg-surface-container-lowest border border-outline-variant px-2 py-1 transition-colors hover:text-highlighted',
      }"
    />
  </NuxtLink>
  <UBadge
    v-else
    :label="label"
    :title="title"
    color="neutral"
    variant="outline"
    size="sm"
    :ui="{
      base: 'rounded-none font-label text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-on-surface-variant bg-surface-container-lowest border border-outline-variant px-2 py-1',
    }"
  />
</template>
