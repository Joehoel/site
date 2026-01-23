<script setup lang="ts">
// Simple search button that triggers the global ContentSearch modal
</script>

<template>
  <div class="ms-auto">
    <UContentSearchButton
      class="flex h-9 w-9 items-center justify-center rounded-md hover:text-accent"
      :collapsed="true"
    />
  </div>
</template>
