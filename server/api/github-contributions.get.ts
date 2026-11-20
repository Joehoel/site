import { Effect } from "effect";
import { GitHub, type ContributionCalendar } from "../services/GitHub";

const emptyCalendar: ContributionCalendar = { totalContributions: 0, weeks: [] };

/** GitHub contribution calendar for the Brag page. Prerendered; runs at build time only. */
export default defineEffectHandler(
  Effect.gen(function* () {
    const github = yield* GitHub;
    const calendar = yield* github.contributions("Joehoel");
    yield* Effect.logInfo("GitHub contributions loaded").pipe(
      Effect.annotateLogs({
        totalContributions: calendar.totalContributions,
        weeks: calendar.weeks.length,
      }),
    );
    return calendar;
  }).pipe(
    Effect.catchTag("GitHubError", (error) => logDegraded(error).pipe(Effect.as(emptyCalendar))),
  ),
  { fallback: emptyCalendar },
);
