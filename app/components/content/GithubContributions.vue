<script setup lang="ts">
const { data: calendar } = await useFetch("/api/github-contributions");
const { date } = useAppConfig();
const dateFormat = new Intl.DateTimeFormat(date.locale, { ...date.options, timeZone: "UTC" });
const numberFormat = new Intl.NumberFormat(date.locale);

const days = computed(() =>
  calendar.value?.weeks.flatMap((week, weekIndex) =>
    week.contributionDays.map(({ date, contributionCount, contributionLevel }) => {
      const day = new Date(date);
      const noun = contributionCount === 1 ? "contribution" : "contributions";
      return {
        date,
        contributionLevel,
        label: `${numberFormat.format(contributionCount)} ${noun} on ${dateFormat.format(day)}`,
        column: weekIndex + 1,
        row: day.getUTCDay() + 1,
      };
    }),
  ),
);
</script>

<template>
  <div
    v-if="calendar && days?.length"
    data-github-contributions
    class="bg-surface-container-low p-4 sm:p-8"
  >
    <p class="mb-4 font-label text-[0.6875rem] uppercase tracking-[0.2em] text-on-surface-variant">
      {{ numberFormat.format(calendar.totalContributions) }}
      {{ calendar.totalContributions === 1 ? "contribution" : "contributions" }} in the last year
    </p>

    <div
      class="overflow-x-auto focus-visible:outline focus-visible:outline-outline"
      role="region"
      aria-label="GitHub contribution calendar"
      tabindex="0"
    >
      <div class="contribution-grid" role="list" aria-label="Daily contributions">
        <span
          v-for="day in days"
          :key="day.date"
          class="contribution-day"
          :data-level="day.contributionLevel"
          :style="{ gridColumn: day.column, gridRow: day.row }"
          :title="day.label"
          :aria-label="day.label"
          role="listitem"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(.github-activity:not(:has([data-github-contributions]))) {
  display: none;
}

.contribution-grid {
  display: grid;
  width: max-content;
  grid-template-columns: repeat(53, 0.625rem);
  grid-template-rows: repeat(7, 0.625rem);
  gap: 0.125rem;
}

.contribution-day {
  background: var(--color-surface-container-highest);
}

.contribution-day[data-level="FIRST_QUARTILE"] {
  background: color-mix(in oklab, var(--ui-primary) 25%, var(--color-surface-container-highest));
}

.contribution-day[data-level="SECOND_QUARTILE"] {
  background: color-mix(in oklab, var(--ui-primary) 50%, var(--color-surface-container-highest));
}

.contribution-day[data-level="THIRD_QUARTILE"] {
  background: color-mix(in oklab, var(--ui-primary) 75%, var(--color-surface-container-highest));
}

.contribution-day[data-level="FOURTH_QUARTILE"] {
  background: var(--ui-primary);
}
</style>
