type ContributionCalendar = {
  totalContributions: number;
  weeks: {
    contributionDays: {
      date: string;
      contributionCount: number;
      contributionLevel:
        | "NONE"
        | "FIRST_QUARTILE"
        | "SECOND_QUARTILE"
        | "THIRD_QUARTILE"
        | "FOURTH_QUARTILE";
    }[];
  }[];
};

type GitHubResponse = {
  data?: {
    user: { contributionsCollection: { contributionCalendar: ContributionCalendar } } | null;
  };
  errors?: { message: string }[];
};

const USER = "Joehoel";
const TOKEN_FIX =
  "Check NUXT_GITHUB_TOKEN (Vercel env + local .env): a fine-grained token with public read access that hasn't expired.";
const emptyCalendar: ContributionCalendar = { totalContributions: 0, weeks: [] };

/** GitHub contribution calendar for the Brag page. Prerendered; runs at build time only. */
export default defineEventHandler(async (event) => {
  const log = useLogger(event);
  const { githubToken } = useRuntimeConfig(event);
  log.set({ github: { user: USER } });

  if (!githubToken) {
    log.warn("NUXT_GITHUB_TOKEN is not set; the contribution graph will be hidden", {
      github: { skipped: "no-token" },
    });
    return emptyCalendar;
  }

  const response = await fetchUpstream<GitHubResponse>("https://api.github.com/graphql", {
    name: "github",
    fix: TOKEN_FIX,
    method: "POST",
    headers: { Authorization: `bearer ${githubToken}` },
    body: {
      query: `{
        user(login: "${USER}") {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays { date contributionCount contributionLevel }
              }
            }
          }
        }
      }`,
    },
  });

  if (response?.errors?.length) {
    log.error(
      createEvlogError({
        message: "GitHub GraphQL returned errors",
        status: 502,
        why: response.errors.map((error) => error.message).join("; "),
        fix: TOKEN_FIX,
      }),
    );
    return emptyCalendar;
  }

  const calendar = response?.data?.user?.contributionsCollection.contributionCalendar;
  if (!calendar) {
    if (response) log.warn(`GitHub returned no contribution calendar for ${USER}`);
    return emptyCalendar;
  }

  log.set({
    github: { totalContributions: calendar.totalContributions, weeks: calendar.weeks.length },
  });
  return calendar;
});
