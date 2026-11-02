<script setup lang="ts">
defineProps<{
  /** Section number eyebrow (e.g. "SECTION_01"). */
  index?: string;
  /** Section heading (e.g. "Hardware"). */
  heading: string;
  /** Sub-label under the heading (e.g. "Physical Stack"). */
  kicker?: string;
  /**
   * Content layout. `rows` stacks children with hairline gaps (hardware);
   * `grid` lays them out in a 2-col card grid (software).
   */
  layout?: "rows" | "grid";
}>();
</script>

<template>
  <!-- Asymmetric 12-col section: sticky metadata aside (left) + content (right). -->
  <section class="grid grid-cols-1 gap-8 md:grid-cols-12">
    <aside class="md:col-span-3">
      <div class="sticky top-28">
        <Eyebrow v-if="index" :label="index" class="mb-1" />
        <h2 class="font-headline text-2xl font-bold text-highlighted">{{ heading }}</h2>
        <p
          v-if="kicker"
          class="mt-2 font-label text-xs uppercase tracking-[0.2em] text-outline-variant"
        >
          {{ kicker }}
        </p>
      </div>
    </aside>

    <div
      class="md:col-span-9"
      :class="
        (layout ?? 'rows') === 'grid'
          ? 'grid grid-cols-1 gap-px sm:grid-cols-2'
          : 'flex flex-col gap-px'
      "
    >
      <slot />
    </div>
  </section>
</template>
