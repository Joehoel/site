type Share = { name: string; percent: number };
type Category = Share & { total_seconds: number };
// WakaTime sends ai_coding_seconds as a numeric string.
type Language = Category & { ai_coding_seconds?: string | number };
type StatsResponse = {
  data?: {
    total_seconds: number;
    daily_average: number;
    human_readable_range: string;
    days_including_holidays: number;
    holidays: number;
    best_day?: { date: string; total_seconds: number } | null;
    languages: Language[];
    editors: Share[];
    ai_models?: Share[];
    categories?: Category[];
    // Private stats only.
    ai_model_breakdown?: { name: string; lines: number }[];
    ai_sessions?: number;
    ai_prompt_events_total?: number;
    ai_additions?: number;
    ai_deletions?: number;
    ai_input_tokens?: number;
    ai_output_tokens?: number;
  };
};
type DaysResponse = {
  data?: { days: { date: string; total: number; categories: { name: string; total: number }[] }[] };
};
type LanguagesResponse = { data?: { name: string; color: string | null }[] };

const API = "https://wakatime.com/api/v1";
const round1 = (value: number) => Math.round(value * 10) / 10;

const top = <T extends Share>(items: T[] = [], count: number) =>
  items
    .filter((item) => item.name !== "Other")
    .slice(0, count)
    .map((item) => ({ ...item, percent: round1(item.percent) }));

// WakaTime's "AI model" mixes model names with harness names (OpenCode, Pi, VS Code…), and splits
// Claude into Claude/Opus/Sonnet/… Group real models into families; harness-only lines have no
// known model (colour null → neutral on the client).
const FAMILIES: Record<string, { family: string; color: string }> = {
  Claude: { family: "Claude", color: "#d97757" },
  Opus: { family: "Claude", color: "#d97757" },
  Sonnet: { family: "Claude", color: "#d97757" },
  Haiku: { family: "Claude", color: "#d97757" },
  Fable: { family: "Claude", color: "#d97757" },
  GPT: { family: "GPT", color: "#10a37f" },
  Gemini: { family: "Gemini", color: "#4285f4" },
};
const UNKNOWN = { family: "Model unknown", color: null };

function aiModels(data: NonNullable<StatsResponse["data"]>) {
  const rows = data.ai_model_breakdown?.length
    ? data.ai_model_breakdown.map(({ name, lines }) => ({ name, value: lines }))
    : (data.ai_models ?? []).map(({ name, percent }) => ({ name, value: percent }));
  const totals = new Map<string, { color: string | null; value: number }>();
  for (const { name, value } of rows) {
    const { family, color } = FAMILIES[name] ?? UNKNOWN;
    totals.set(family, { color, value: (totals.get(family)?.value ?? 0) + value });
  }
  const sum = [...totals.values()].reduce((a, b) => a + b.value, 0);
  return [...totals]
    .filter(([, { value }]) => value > 0)
    .map(([name, { color, value }]) => ({ name, color, percent: round1((value / sum) * 100) }))
    .toSorted(
      // Known families by size, the unknown bucket last.
      (a, b) => Number(!a.color) - Number(!b.color) || b.percent - a.percent,
    );
}

/**
 * With NUXT_WAKATIME_TOKEN: the private past-year stats plus a per-day series.
 * Without it: the public profile, which only shares all-time stats.
 */
export default defineEventHandler(async (event) => {
  const { wakatimeToken } = useRuntimeConfig(event);
  const base = { retry: 0, timeout: 8000 } as const;
  const auth = { ...base, headers: { Authorization: `Bearer ${wakatimeToken}` } };

  try {
    const [{ data }, days, languages] = await Promise.all([
      wakatimeToken
        ? $fetch<StatsResponse>(`${API}/users/current/stats/last_year`, auth)
        : $fetch<StatsResponse>(`${API}/users/joehoel/stats/all_time`, base),
      wakatimeToken
        ? $fetch<DaysResponse>(`${API}/users/current/insights/days/last_year`, auth).catch(
            () => null,
          )
        : null,
      // Linguist colours per language; optional, so a failure only drops the colours.
      $fetch<LanguagesResponse>(`${API}/program_languages`, base).catch(() => null),
    ]);
    if (!data?.total_seconds) return null;

    const colors = new Map(languages?.data?.map(({ name, color }) => [name, color]));
    const ai = data.categories?.find((category) => category.name === "AI Coding");

    return {
      range: wakatimeToken ? "past year" : data.human_readable_range,
      totalSeconds: Math.round(data.total_seconds),
      dailyAverageSeconds: Math.round(data.daily_average),
      daysCoded: data.days_including_holidays - data.holidays,
      bestDay: data.best_day
        ? { date: data.best_day.date, seconds: Math.round(data.best_day.total_seconds) }
        : null,
      ai: ai?.total_seconds
        ? { seconds: Math.round(ai.total_seconds), percent: round1(ai.percent) }
        : null,
      languages: top(data.languages, 6).map((l) => ({
        name: l.name,
        percent: l.percent,
        color: colors.get(l.name) ?? null,
        aiPercent: l.total_seconds
          ? Math.round((Number(l.ai_coding_seconds) / l.total_seconds) * 100)
          : 0,
      })),
      editors: top(data.editors, 4).map(({ name, percent }) => ({ name, percent })),
      /** Share of AI line changes per model family (private), or of AI time (public). */
      aiModels: aiModels(data),
      agents: data.ai_sessions
        ? {
            sessions: data.ai_sessions,
            prompts: data.ai_prompt_events_total ?? 0,
            additions: data.ai_additions ?? 0,
            deletions: data.ai_deletions ?? 0,
            inputTokens: data.ai_input_tokens ?? 0,
            outputTokens: data.ai_output_tokens ?? 0,
          }
        : null,
      /** Seconds per day, split into AI and other coding. Only with a token. */
      days:
        days?.data?.days.map(({ date, total, categories }) => {
          const ai = categories.find((c) => c.name === "AI Coding")?.total ?? 0;
          return { date, ai: Math.round(ai), other: Math.round(Math.max(total - ai, 0)) };
        }) ?? null,
    };
  } catch {
    console.warn("[wakatime-stats] Could not load WakaTime stats.");
    return null;
  }
});
