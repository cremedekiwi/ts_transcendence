import { App } from "../classes/App.js"
import { routeParams } from "../types/routes.js"
import { createDurationPerGameChart, createMostPlayedUsersChart, createScorePerGameChart, createWinLossChart } from "../utils/charts.js"
import { calculateStatistics, getUserDataOrRedirect, getUsernameOrRedirect } from "./profil.js"

/**
 * Generates the HTML for the stats page.
 */
function statsHTML(): string {
	const content = /* HTML */ `
		<section class="[&>article]:center large-size grid grid-cols-3 grid-rows-2 gap-4 [&>article]:container">
			<article class="col-span-1 row-span-1">
				<canvas id="winLossChart" class="w-full"></canvas>
			</article>
			<article class="col-span-2 row-span-1">
				<canvas id="scorePerGameChart" class="w-full"></canvas>
			</article>
			<article class="col-span-2 row-span-1">
				<canvas id="durationPerGameChart" class="w-full"></canvas>
			</article>
			<article class="col-span-1 row-span-1">
				<canvas id="mostPlayedUsersChart" class="w-full"></canvas>
			</article>
		</section>
	`

	return content
}

export async function renderStats(app: App, params?: routeParams) {
	// Get the username or redirect if necessary
	const username = getUsernameOrRedirect(app, params)
	if (!username) return

	// Fetch user data or render 404 if the user does not exist
	const userData = getUserDataOrRedirect(app, username)
	if (!userData) return

	// Fetch matches from the cache
	const matches = await app.cache.getMatchesByUsername(username)

	// Calculate statistics
	const stats = calculateStatistics(matches, username)

	// Render the stats page
	app.changeContent(statsHTML())
	createWinLossChart(stats.win, stats.loose)
	createScorePerGameChart(username, matches)
	createDurationPerGameChart(matches)
	createMostPlayedUsersChart(username, matches)
	app.hideBackground()
}
