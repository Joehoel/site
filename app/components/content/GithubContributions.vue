<script setup lang="ts">
const props = defineProps<{
  /** Section heading (rendered by SpecSection). */
  heading?: string;
}>();

const appConfig = useAppConfig();
const { data } = await useFetch("/api/github-contributions", { key: "github-contributions" });

const LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
} as const;
const STEP = 12; // 10px cell + 2px gap, in SVG units
const CELL = 10;

// Dates are calendar days ("YYYY-MM-DD"); read and print them in UTC so they never drift.
const utc = (date: string) => new Date(`${date}T00:00:00Z`);
const fmt = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(appConfig.date.locale, { ...options, timeZone: "UTC" });
const dayFmt = fmt(appConfig.date.options);
const monthFmt = fmt({ month: "short" });
const monthYearFmt = fmt({ month: "long", year: "numeric" });
const num = new Intl.NumberFormat(appConfig.date.locale);

const view = computed(() => {
  const weeks = data.value?.weeks ?? [];
  const days = weeks.flatMap((week) => week.contributionDays);
  if (!days.length || !data.value?.totalContributions) return null;

  const cells = weeks.flatMap((week, x) =>
    week.contributionDays.map((day) => ({
      x: x * STEP,
      y: utc(day.date).getUTCDay() * STEP,
      level: LEVELS[day.contributionLevel],
      title: `${num.format(day.contributionCount)} ${day.contributionCount === 1 ? "contribution" : "contributions"} · ${dayFmt.format(utc(day.date))}`,
    })),
  );

  // A tick on every week holding the 1st, plus the opening month when it has room for a label.
  const ticks = weeks.flatMap((week, x) => {
    const first = week.contributionDays.find((day) => day.date.endsWith("-01"));
    return first ? [{ x, date: first.date }] : [];
  });
  if ((ticks[0]?.x ?? Infinity) >= 3) ticks.unshift({ x: 0, date: days[0]!.date });

  const months = new Map<string, number>();
  let streak = 0;
  let longest = 0;
  let best = days[0]!;
  for (const day of days) {
    const month = day.date.slice(0, 7);
    months.set(month, (months.get(month) ?? 0) + day.contributionCount);
    streak = day.contributionCount ? streak + 1 : 0;
    longest = Math.max(longest, streak);
    if (day.contributionCount > best.contributionCount) best = day;
  }
  const activeDays = days.filter((day) => day.contributionCount > 0).length;

  return {
    width: weeks.length * STEP - (STEP - CELL),
    cells,
    ticks: ticks
      .filter((tick) => tick.x <= weeks.length - 3)
      .map((tick) => ({
        left: (tick.x / weeks.length) * 100,
        label: monthFmt.format(utc(tick.date)),
      })),
    months: [...months].map(([month, count]) => ({
      label: monthYearFmt.format(utc(`${month}-01`)),
      count: num.format(count),
    })),
    range: `${dayFmt.format(utc(days[0]!.date))} – ${dayFmt.format(utc(days.at(-1)!.date))}`,
    stats: [
      {
        label: "Contributions",
        value: num.format(data.value.totalContributions),
        note: "past year",
      },
      { label: "Active days", value: num.format(activeDays), note: `of ${days.length} days` },
      { label: "Longest streak", value: num.format(longest), note: longest === 1 ? "day" : "days" },
      {
        label: "Busiest day",
        value: num.format(best.contributionCount),
        note: dayFmt.format(utc(best.date)),
      },
    ],
  };
});

const github = appConfig.socials.find((social) => social.label === "GitHub");
</script>

<template>
  <!-- Renders nothing (not even the section) when the calendar is unavailable. -->
  <SpecSection
    v-if="view"
    :heading="props.heading ?? 'Activity'"
    kicker="GitHub"
    :aria-label="props.heading ?? 'Activity'"
  >
    <dl class="grid grid-cols-2 gap-px lg:grid-cols-4">
      <div
        v-for="stat in view.stats"
        :key="stat.label"
        class="flex flex-col bg-surface-container-low p-6 md:p-8"
      >
        <dt
          class="mb-3 font-label text-[0.6875rem] uppercase tracking-[0.2em] text-on-surface-variant"
        >
          {{ stat.label }}
        </dt>
        <dd class="font-headline text-3xl font-bold tracking-tight text-highlighted md:text-4xl">
          {{ stat.value }}
        </dd>
        <dd class="mt-1 font-label text-xs text-outline">{{ stat.note }}</dd>
      </div>
    </dl>

    <div class="bg-surface-container-low p-4 sm:p-6 md:p-8">
      <div class="relative mb-2 h-4" aria-hidden="true">
        <span
          v-for="(tick, i) in view.ticks"
          :key="tick.left"
          :class="{ 'max-sm:hidden': i % 2 }"
          class="absolute top-0 font-label text-[0.625rem] uppercase tracking-[0.1em] text-outline"
          :style="{ left: `${tick.left}%` }"
        >
          {{ tick.label }}
        </span>
      </div>

      <!-- Visual only: the same data is in the table below, so screen readers skip the 365 cells. -->
      <svg
        :viewBox="`0 0 ${view.width} ${7 * STEP - (STEP - CELL)}`"
        class="block h-auto w-full"
        aria-hidden="true"
        focusable="false"
      >
        <rect
          v-for="cell in view.cells"
          :key="`${cell.x}-${cell.y}`"
          :x="cell.x"
          :y="cell.y"
          :width="CELL"
          :height="CELL"
          :class="`level-${cell.level}`"
        >
          <title>{{ cell.title }}</title>
        </rect>
      </svg>

      <div
        class="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 font-label text-[0.6875rem] uppercase tracking-[0.1em] text-outline"
      >
        <span class="legend flex items-center gap-2" aria-hidden="true">
          Less
          <span v-for="level in 5" :key="level" :class="`level-${level - 1} size-2.5`" />
          More
        </span>
        <a
          v-if="github"
          :href="github.url"
          rel="noreferrer"
          target="_blank"
          class="group inline-flex items-center gap-x-2 text-highlighted"
        >
          View on GitHub
          <UIcon
            name="i-lucide-arrow-up-right"
            class="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      </div>

      <!-- Wrapper owns sr-only: a table ignores width:1px and could widen the page. -->
      <div class="sr-only">
        <table>
          <caption>
            GitHub contributions per month,
            {{
              view.range
            }}
          </caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Contributions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="month in view.months" :key="month.label">
              <th scope="row">{{ month.label }}</th>
              <td>{{ month.count }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </SpecSection>
</template>

<style scoped>
/* Vivid OKLCH green ramp, tuned per color mode. Empty cells sit one step above the panel. */
svg,
.legend {
  --heat-0: var(--color-surface-container-highest);
  --heat-1: oklch(0.88 0.1 152);
  --heat-2: oklch(0.8 0.17 150);
  --heat-3: oklch(0.72 0.21 148);
  --heat-4: oklch(0.64 0.22 147);
}
:where(.dark) svg,
:where(.dark) .legend {
  --heat-1: oklch(0.45 0.12 152);
  --heat-2: oklch(0.6 0.18 150);
  --heat-3: oklch(0.75 0.23 148);
  --heat-4: oklch(0.88 0.25 146);
}
.level-0 {
  --level: var(--heat-0);
}
.level-1 {
  --level: var(--heat-1);
}
.level-2 {
  --level: var(--heat-2);
}
.level-3 {
  --level: var(--heat-3);
}
.level-4 {
  --level: var(--heat-4);
}
rect {
  fill: var(--level);
}
span[class*="level-"] {
  background-color: var(--level);
}
</style>
