<script setup lang="ts">
const props = defineProps({
  code: {
    type: String,
    default: "",
  },
  language: {
    type: String,
    default: null,
  },
  filename: {
    type: String,
    default: null,
  },
  highlights: {
    type: Array,
    default: () => [],
  },
  meta: {
    type: String,
    default: null,
  },
  class: {
    type: String,
    default: null,
  },
});

// Spec-header label: prefer the filename, else the language, else a generic
// SOURCE tag. Mirrors the "// engine/wal.rs" header from the Atelier mock.
const sourceLabel = computed(() => props.filename ?? props.language ?? "source");

const copied = ref(false);
let resetTimer: ReturnType<typeof setTimeout> | undefined;

async function copy() {
  if (!props.code || !import.meta.client || !navigator.clipboard) return;
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => (copied.value = false), 1500);
  } catch {
    // Clipboard unavailable (e.g. insecure context) — fail silently.
  }
}

onBeforeUnmount(() => clearTimeout(resetTimer));
</script>

<template>
  <!-- Inset code panel: tonal layering (surface-container-lowest), no border. -->
  <div class="not-prose group my-8 bg-surface-container-lowest">
    <!-- Spec header: // SOURCE label + copy affordance. -->
    <div class="flex items-center justify-between px-4 py-3">
      <Eyebrow :label="sourceLabel" />
      <button
        aria-label="Copy code"
        class="flex items-center gap-1.5 font-label text-[0.6875rem] uppercase tracking-[0.1em] text-outline transition-colors hover:text-highlighted"
        type="button"
        @click="copy"
      >
        <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" class="size-3.5" />
        <span>{{ copied ? "Copied" : "Copy" }}</span>
      </button>
    </div>

    <pre :class="['overflow-x-auto px-4 pb-4', $props.class]"><slot /></pre>
  </div>
</template>

<style>
pre code .line {
  display: block;
}
</style>
