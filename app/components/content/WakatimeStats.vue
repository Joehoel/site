<script setup lang="ts">
const props = defineProps<{
  /** Section heading (rendered by SpecSection). */
  heading?: string;
}>();

const appConfig = useAppConfig();
const { data } = await useFetch("/api/wakatime-stats", { key: "wakatime-stats" });

const num = new Intl.NumberFormat(appConfig.date.locale, { maximumFractionDigits: 1 });
const hours = (seconds: number) => num.format(Math.round(seconds / 3600));
const hoursExact = (seconds: number) => num.format(seconds / 3600);
const dayFmt = new Intl.DateTimeFormat(appConfig.date.locale, {
  ...appConfig.date.options,
  timeZone: "UTC",
});
const day = (date: string) => dayFmt.format(new Date(`${date}T00:00:00Z`));
const BAR = 3; // SVG units per day (2 bar + 1 gap)
const pct = (value: number) => `${num.format(value)}%`;
const compact = new Intl.NumberFormat(appConfig.date.locale, {
  notation: "compact",
  maximumFractionDigits: 1,
}).format;
// Items without a known colour (unlisted languages, unknown AI model) stay neutral.
const withColor = <T extends { color: string | null }>(item: T) => ({
  ...item,
  color: item.color ?? "var(--color-outline)",
});

const view = computed(() => {
  const stats = data.value;
  if (!stats) return null;
  const [topLanguage] = stats.languages;
  const max = Math.max(...(stats.days ?? []).map((d) => d.ai + d.other), 1);
  return {
    stats: [
      {
        label: "Coding time",
        value: hours(stats.totalSeconds),
        note: `hrs · ${stats.range}`,
      },
      stats.ai && {
        label: "AI coding",
        value: hours(stats.ai.seconds),
        note: `hrs · ${pct(stats.ai.percent)} of coding`,
      },
      {
        label: "Daily average",
        value: hoursExact(stats.dailyAverageSeconds),
        note: `hrs · ${num.format(stats.daysCoded)} days coded`,
      },
      stats.bestDay
        ? {
            label: "Best day",
            value: hoursExact(stats.bestDay.seconds),
            note: `hrs · ${day(stats.bestDay.date)}`,
          }
        : topLanguage && {
            label: "Top language",
            value: topLanguage.name,
            note: pct(topLanguage.percent),
            word: true,
          },
    ].filter(Boolean) as { label: string; value: string; note: string; word?: boolean }[],
    // Stacked bar per day (AI on top of other coding), scaled to the busiest day.
    chart: stats.days?.length
      ? {
          width: stats.days.length * BAR,
          from: day(stats.days[0]!.date),
          to: day(stats.days.at(-1)!.date),
          bars: stats.days.flatMap((d, i) => {
            if (!d.ai && !d.other) return [];
            const other = (d.other / max) * 100;
            const ai = (d.ai / max) * 100;
            return {
              x: i * BAR,
              other,
              ai,
              title: `${hoursExact(d.ai + d.other)} hrs (${hoursExact(d.ai)} AI) · ${day(d.date)}`,
            };
          }),
        }
      : null,
    breakdowns: [
      // Linguist colours, clamped per colour mode in CSS so dark/yellow hues stay visible.
      {
        title: "Languages",
        items: stats.languages.map((l) => ({
          ...withColor(l),
          note: l.aiPercent >= 1 ? `${l.aiPercent}% AI` : "",
        })),
      },
      {
        title: stats.agents ? "AI models · by lines changed" : "AI models · by time",
        items: stats.aiModels.map((m) => ({ ...withColor(m), note: "" })),
      },
    ].filter((group) => group.items.length),
    editors: stats.editors,
    agents: stats.agents && [
      { label: "Sessions", value: compact(stats.agents.sessions) },
      { label: "Prompts", value: compact(stats.agents.prompts) },
      {
        label: "Lines changed",
        value: `+${compact(stats.agents.additions)} / −${compact(stats.agents.deletions)}`,
      },
      {
        label: "Tokens in / out",
        value: `${compact(stats.agents.inputTokens)} / ${compact(stats.agents.outputTokens)}`,
      },
    ],
  };
});
</script>

<template>
  <!-- Renders nothing (not even the section) when WakaTime is unavailable. -->
  <SpecSection
    v-if="view"
    :heading="props.heading ?? 'Coding'"
    kicker="WakaTime"
    :aria-label="props.heading ?? 'Coding'"
  >
    <dl class="grid grid-cols-2 gap-px lg:grid-cols-4">
      <div
        v-for="stat in view.stats"
        :key="stat.label"
        class="flex min-w-0 flex-col bg-surface-container-low p-6 md:p-8"
      >
        <dt
          class="mb-3 font-label text-[0.6875rem] uppercase tracking-[0.2em] text-on-surface-variant"
        >
          {{ stat.label }}
        </dt>
        <dd
          class="truncate font-headline font-bold tracking-tight text-highlighted md:text-4xl"
          :class="stat.word ? 'text-xl sm:text-3xl' : 'text-3xl'"
        >
          {{ stat.value }}
        </dd>
        <dd class="mt-1 font-label text-xs text-outline">{{ stat.note }}</dd>
      </div>
    </dl>

    <div class="bg-surface-container-low p-4 sm:p-6 md:p-8">
      <div v-if="view.chart" class="mb-10">
        <div class="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h3
            class="font-label text-[0.6875rem] uppercase tracking-[0.2em] text-on-surface-variant"
          >
            Hours per day
          </h3>
          <p
            class="flex items-center gap-4 font-label text-[0.6875rem] uppercase tracking-[0.1em] text-outline"
            aria-hidden="true"
          >
            <span class="flex items-center gap-2"><span class="bar-other size-2.5" />Coding</span>
            <span class="flex items-center gap-2"><span class="bar-ai size-2.5" />AI coding</span>
          </p>
        </div>
        <!-- Visual only: the stat panels above carry the totals. -->
        <svg
          :viewBox="`0 0 ${view.chart.width} 100`"
          preserveAspectRatio="none"
          class="block h-24 w-full md:h-32"
          aria-hidden="true"
          focusable="false"
        >
          <g v-for="bar in view.chart.bars" :key="bar.x">
            <title>{{ bar.title }}</title>
            <rect
              v-if="bar.other"
              class="bar-other"
              :x="bar.x"
              :y="100 - bar.other"
              width="2"
              :height="bar.other"
            />
            <rect
              v-if="bar.ai"
              class="bar-ai"
              :x="bar.x"
              :y="100 - bar.other - bar.ai"
              width="2"
              :height="bar.ai"
            />
          </g>
        </svg>
        <p
          class="mt-2 flex justify-between font-label text-[0.625rem] uppercase tracking-[0.1em] text-outline"
          aria-hidden="true"
        >
          <span>{{ view.chart.from }}</span
          ><span>{{ view.chart.to }}</span>
        </p>
      </div>

      <div v-for="group in view.breakdowns" :key="group.title" class="mb-8 last-of-type:mb-0">
        <h3
          class="mb-4 font-label text-[0.6875rem] uppercase tracking-[0.2em] text-on-surface-variant"
        >
          {{ group.title }}
        </h3>
        <!-- Visual only: the list below carries the same numbers. -->
        <div class="mb-6 flex h-3 w-full gap-0.5" aria-hidden="true">
          <span
            v-for="item in group.items"
            :key="item.name"
            class="swatch"
            :style="{ width: `${item.percent}%`, '--c': item.color }"
          />
          <span class="flex-1 bg-surface-container-highest" />
        </div>
        <ul class="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          <li
            v-for="item in group.items"
            :key="item.name"
            class="flex min-w-0 items-center gap-2 font-body text-sm text-on-surface-variant"
          >
            <span
              class="swatch size-2.5 shrink-0"
              :style="{ '--c': item.color }"
              aria-hidden="true"
            />
            <span class="truncate text-highlighted">{{ item.name }}</span>
            <span class="ml-auto shrink-0 font-label text-xs text-outline">
              {{ pct(item.percent) }}<template v-if="item.note"> · {{ item.note }}</template>
            </span>
          </li>
        </ul>
      </div>

      <div v-if="view.agents" class="mt-10">
        <h3
          class="mb-4 font-label text-[0.6875rem] uppercase tracking-[0.2em] text-on-surface-variant"
        >
          AI agents
        </h3>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
          <div v-for="item in view.agents" :key="item.label" class="min-w-0">
            <dt class="mb-1 font-label text-[0.625rem] uppercase tracking-[0.1em] text-outline">
              {{ item.label }}
            </dt>
            <dd class="truncate font-headline text-xl font-bold tracking-tight text-highlighted">
              {{ item.value }}
            </dd>
          </div>
        </dl>
      </div>

      <div
        class="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 font-label text-[0.6875rem] uppercase tracking-[0.1em] text-outline"
      >
        <p v-if="view.editors.length">
          Editors:
          <span class="text-on-surface-variant">
            {{ view.editors.map((editor) => `${editor.name} ${pct(editor.percent)}`).join(" · ") }}
          </span>
        </p>
        <a
          :href="'https://wakatime.com/@joehoel'"
          rel="noreferrer"
          target="_blank"
          class="group inline-flex items-center gap-x-2 text-highlighted"
        >
          View on WakaTime
          <UIcon
            name="i-lucide-arrow-up-right"
            class="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      </div>
    </div>
  </SpecSection>
</template>

<style scoped>
/* Activity tokens live in main.css, shared with the GitHub heatmap. */
.bar-other {
  fill: var(--color-heat-4);
  background: var(--color-heat-4);
}
.bar-ai {
  fill: var(--color-ai);
  background: var(--color-ai);
}

/*
 * Keep each colour's hue and chroma but clamp its lightness (relative colour syntax), so
 * near-black JSON stays visible on dark and JavaScript yellow stays visible on light.
 */
.swatch {
  background: var(--c);
  background: oklch(from var(--c) max(l, 0.62) c h);
}
:where(.light) .swatch {
  background: oklch(from var(--c) min(l, 0.7) c h);
}
</style>
