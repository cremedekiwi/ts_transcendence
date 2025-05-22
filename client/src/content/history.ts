import { App } from "../classes/App.js"
import { fullHistoryCard } from "../components/history.js"
import { t } from "../translations/translations.js"
import { Match } from "../types/match.js"
import { routeParams } from "../types/routes.js"
import { getUserDataOrRedirect, getUsernameOrRedirect } from "./profil.js"

export async function renderHistory(app: App, params?: routeParams) {
	app.hideBackground()
	// Get the username or redirect if necessary
	const username = getUsernameOrRedirect(app, params)
	if (!username) return

	// Fetch user data or render 404 if the user does not exist
	const userData = getUserDataOrRedirect(app, username)
	if (!userData) return

	// Fetch matches from the cache and reverse them
	const matches = (await app.cache.getMatchesByUsername(username)).slice().reverse()

	// Render the history page
	const pageContent = await historyHTML(app, username, matches)
	// Wait for 2 seconds before showing the content

	app.changeContent(pageContent)
}

/**
 * Generates the HTML for the history page.
 */
export async function historyHTML(app: App, username: string, matches: Match[]): Promise<string> {
	// Generate the match history HTML starting from the most recent match
	const matchHistories = matches.map((match) => fullHistoryCard(app, username, match)).join("")

	const center = /* HTML */ `
		<section class="large-size container">
			<div class="custom-scrollbar flex h-full flex-col overflow-y-auto text-sm">
				${matchHistories || `<p class="text-center my-auto">${t("noMatchesFound")}</p>`}
			</div>
		</section>
	`

	return center
}
