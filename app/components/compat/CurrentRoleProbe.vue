<script setup lang="ts">
defineProps<{ label: string }>();
</script>

<template>
  <span data-synthetic-inline>{{ label }}</span>
</template>
