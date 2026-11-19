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
  errors?: unknown[];
};

const emptyCalendar: ContributionCalendar = { totalContributions: 0, weeks: [] };
let warned = false;

function unavailable(reason: string) {
  if (!warned) {
    console.warn(`[github-contributions] ${reason}`);
    warned = true;
  }
  return emptyCalendar;
}

export default defineEventHandler(async (event) => {
  const { githubToken } = useRuntimeConfig(event);
  if (!githubToken) return unavailable("NUXT_GITHUB_TOKEN is missing.");

  try {
    const response = await $fetch<GitHubResponse>("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `bearer ${githubToken}` },
      retry: 0,
      timeout: 5000,
      body: {
        query: `{
          user(login: "Joehoel") {
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

    const calendar = response.data?.user?.contributionsCollection.contributionCalendar;
    if (calendar && !response.errors?.length) return calendar;
  } catch {
    // Upstream errors can contain request details, so log only a fixed message.
  }

  return unavailable("Could not load the GitHub contribution calendar.");
});
