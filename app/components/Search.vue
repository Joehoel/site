<script setup lang="ts">
// Search trigger for the header — opens the global UContentSearch modal
// (Pagefind, ⌘K). Collapsed to an icon button to match the Atelier chrome.
</script>

<template>
  <UContentSearchButton
    :collapsed="true"
    color="neutral"
    variant="ghost"
    class="h-9 w-9 text-outline transition-colors hover:text-highlighted"
  />
</template>
