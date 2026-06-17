<script setup lang="ts">
defineProps<{
  /** Chip label. Rendered uppercase. */
  label: string;
  /** Whether this chip is the active filter. */
  active?: boolean;
}>();

defineEmits<{ select: [] }>();
</script>

<template>
  <UButton
    color="neutral"
    variant="ghost"
    size="xs"
    :aria-pressed="active"
    :ui="{
      base: [
        'rounded-none font-label text-[0.6875rem] font-medium uppercase tracking-[0.1em] px-3 py-1 transition-colors',
        active
          ? 'bg-surface-container-highest text-highlighted hover:bg-surface-container-highest'
          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
      ],
    }"
    @click="$emit('select')"
  >
    {{ label }}
  </UButton>
</template>
