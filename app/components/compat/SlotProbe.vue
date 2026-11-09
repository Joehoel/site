<script setup lang="ts">
defineProps<{ label: string }>();
</script>

<template>
  <section data-slot-probe :data-label="label">
    <div data-default-slot><slot /></div>
    <aside data-named-slot><slot name="details" /></aside>
  </section>
</template>
