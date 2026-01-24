/**
 * Composable to check if the current user can view draft content.
 * Returns true if:
 * - Running in development mode, OR
 * - User is logged in via Nuxt Studio
 */
export function useCanSeeDrafts() {
	const sessionCookie = useCookie("studio-session-check");

	const canSeeDrafts = computed(
		() => import.meta.dev || String(sessionCookie.value) === "true",
	);

	return canSeeDrafts;
}
