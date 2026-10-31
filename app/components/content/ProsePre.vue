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

const sourceLabel = computed(() => props.filename ?? props.language ?? "source");

const copyStatus = ref<"idle" | "copied" | "error">("idle");
let resetTimer: ReturnType<typeof setTimeout> | undefined;

async function copy() {
  clearTimeout(resetTimer);
  try {
    if (!import.meta.client || !navigator.clipboard) {
      copyStatus.value = "error";
      return;
    }
    await navigator.clipboard.writeText(props.code);
    copyStatus.value = "copied";
    resetTimer = setTimeout(() => (copyStatus.value = "idle"), 1500);
  } catch {
    copyStatus.value = "error";
  }
}

onBeforeUnmount(() => clearTimeout(resetTimer));
</script>

<template>
  <div class="not-prose group my-8 bg-surface-container-lowest">
    <div class="flex items-center justify-between px-4 py-3">
      <Eyebrow :label="sourceLabel" />
      <button
        aria-label="Copy code"
        class="flex items-center gap-1.5 font-label text-[0.6875rem] uppercase tracking-[0.1em] text-outline transition-colors hover:text-highlighted"
        type="button"
        @click="copy"
      >
        <UIcon
          :name="copyStatus === 'copied' ? 'i-lucide-check' : 'i-lucide-copy'"
          aria-hidden="true"
          class="size-3.5"
        />
        <span>{{ copyStatus === "copied" ? "Copied" : "Copy code" }}</span>
      </button>
    </div>
    <p class="px-4 text-sm text-on-surface-variant" role="status" aria-live="polite">
      <template v-if="copyStatus === 'error'">
        Couldn't copy the code. Select it and copy manually.
      </template>
      <span v-else-if="copyStatus === 'copied'" class="sr-only">Copied</span>
    </p>

    <pre :class="['overflow-x-auto px-4 pb-4', $props.class]"><slot /></pre>
  </div>
</template>

<style>
pre code .line {
  display: block;
}
</style>
