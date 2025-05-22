import { App } from "../classes/App.js"
import { baseButton } from "../components/buttons.js"
import { smallHistoryCard } from "../components/history.js"
import { initPlayerButtonEvents, playerCard } from "../components/player_card.js"
import { t } from "../translations/translations.js"
import { Match } from "../types/match.js"
import { routeParams } from "../types/routes.js"
import { UserData } from "../types/user.js"
import { formatTime } from "../utils/utils.js"
import { connectPopup } from "./connect_popup.js"

export async function renderProfil(app: App, params?: routeParams) {
	const username = getUsernameOrRedirect(app, params)
	if (!username) return

	const userData = getUserDataOrRedirect(app, username)
	if (!userData) return

	const matches = await app.cache.getMatchesByUsername(username)
	const stats = calculateStatistics(matches, username)
	const last5Matches = getLast5Matches(matches, app, username)

	// Render the profile page
	const content = await profilHTML(
		app,
		userData,
		stats.nbGame,
		stats.gameTime,
		stats.win,
		stats.loose,
		stats.fastest,
		stats.longest,
		stats.biggestVictory,
		stats.biggestLoose,
		last5Matches,
	)

	app.changeContent(content)
	initPlayerButtonEvents(app)
	app.showBackground()
}

// Returns the username from the URL parameters or from the logged-in user if there is none.
// Opens the connect popup if no parameter or logged in user.
export function getUsernameOrRedirect(app: App, params?: routeParams): string | null {
	if (!params?.username) {
		if (app.loggedUser) {
			return app.loggedUser.username
		} else {
			// console.log("User not logged in, showing connect popup")
			app.router.renderPreviousPage()
			connectPopup(app)
			return null
		}
	}
	return params.username
}

// Fetches user data from the cache and redirects to the 404 page if not found.
export function getUserDataOrRedirect(app: App, username: string): UserData | null {
	const userData = app.cache.getUserByUsername(username)
	if (!userData) {
		// console.log("User not found, showing 404 page")
		app.router.notFound()
		return null
	}
	return userData
}

// Calculates statistics based on a user and his matches
export function calculateStatistics(matches: Match[], username: string) {
	const nbGame = matches.length
	const gameTime = matches.reduce((total, match) => total + match.duration, 0)
	const win = matches.filter((match) => match.winner === username).length
	const loose = nbGame - win
	const fastest = matches.length > 0 ? Math.min(...matches.map((match) => match.duration)) : 0
	const longest = matches.length > 0 ? Math.max(...matches.map((match) => match.duration)) : 0

	const biggestVictory = matches
		.filter((match) => match.winner === username)
		.reduce((prev, curr) => (!prev || curr.score1 - curr.score2 > prev.score1 - prev.score2 ? curr : prev), null as Match | null)

	const biggestLoose = matches
		.filter((match) => match.winner !== username)
		.reduce((prev, curr) => (!prev || curr.score2 - curr.score1 > prev.score2 - prev.score1 ? curr : prev), null as Match | null)

	return { nbGame, gameTime, win, loose, fastest, longest, biggestVictory, biggestLoose }
}

/**
 * Retrieves the last 5 matches based on the profile type (own profile or another user's profile).
 */
function getLast5Matches(matches: Match[], app: App, username: string): Match[] {
	const isOwnProfile = username === app.loggedUser?.username
	const isLoggedOut = !app.isLoggedIn()

	if (isOwnProfile || isLoggedOut) {
		return matches.slice(-5).reverse()
	}

	return matches
		.filter((match) => match.player1 === app.loggedUser!.username || match.player2 === app.loggedUser!.username)
		.slice(-5)
		.reverse()
}

async function profilHTML(
	app: App,
	userData: UserData,
	nbGame: number,
	gameTime: number,
	win: number,
	loose: number,
	fastest: number,
	longest: number,
	biggestVictory: Match | null,
	biggestLoose: Match | null,
	last6Matches: Match[],
): Promise<string> {
	// Statistics
	const statInsightsHTML = /* HTML */ `
		<div class="flex h-[57px] w-full font-bold">
			<article class="border-berry h-[55.9px] w-full border-b px-4">
				${userData.user.username === app.loggedUser?.username
					? `<div class="center h-full">${t("stats")}</div>`
					: playerCard(userData, userData.user.id !== app.loggedUser?.id)}
			</article>
		</div>
		<div class="flex h-full flex-col items-center justify-center px-5 py-6 text-sm">
			<div class="flex min-h-[300px] w-full flex-col justify-center gap-2">
				<div class="flex items-center justify-between">
					<span>${t("gameCount")}:</span>
					<span class="">${nbGame}</span>
				</div>
				<div class="flex items-center justify-between">
					<span>${t("wins")}:</span>
					<span class="text-green">${win}</span>
				</div>
				<div class="flex items-center justify-between">
					<span>${t("loss")}:</span>
					<span class="text-red">${loose}</span>
				</div>
				<div class="flex items-center justify-between">
					<span>${t("winrate")}:</span>
					<span class="text-blue-400">${nbGame > 0 ? ((win * 50) / nbGame).toFixed(2) : "0"}%</span>
				</div>
				<div class="flex items-center justify-between">
					<span>${t("playTime")}:</span>
					<span class="text-yellow-400">${formatTime(gameTime)}</span>
				</div>
				<div class="flex items-center justify-between">
					<span>${t("fastestGame")}:</span>
					<span class="text-yellow-400">${formatTime(fastest)}</span>
				</div>
				<div class="flex items-center justify-between">
					<span>${t("longestGame")}:</span>
					<span class="text-yellow-400">${formatTime(longest)}</span>
				</div>
				<div class="flex items-center justify-between">
					<span>${t("biggestVictory")}:</span>
					${biggestVictory
						? `
						<span class="text-green">${biggestVictory.player1} ${biggestVictory.score1} - ${biggestVictory.score2} ${biggestVictory.player2}</span>
						`
						: t("none")}
				</div>
				<div class="flex items-center justify-between">
					<span>${t("biggestLoose")}:</span>
					${biggestLoose
						? `
						<span class="text-red">${biggestLoose.player1} ${biggestLoose.score1} - ${biggestLoose.score2} ${biggestLoose.player2}</span>
						`
						: t("none")}
				</div>
			</div>
			<div class="mt-4 flex w-full cursor-pointer flex-col items-center justify-center gap-2">
				${baseButton(t("seeMoreStats"), "data-link href=/stats/" + userData.user.username)}
			</div>
		</div>
	`
	// Games with this user
	const historyInsightsHTML = /* HTML */ `
		<div class="flex h-[57px] w-full text-sm font-bold">
			<article class="border-berry flex h-[55.9px] w-full items-center justify-center gap-[19px] border-b px-4">
				${userData.user.username === app.loggedUser?.username ? `${t("games")}` : t("gamesWith") + ` ${userData.user.username}`}
			</article>
		</div>
		<div class="flex h-full flex-col justify-center px-5 py-6 text-sm">
			<div class="no-scrollbar flex min-h-[300px] flex-col justify-center overflow-y-auto text-center">
				${last6Matches.map((match) => smallHistoryCard(userData.user.username, match)).join("") ||
				"Vous n'avez aucun match avec cet utilisateur."}
			</div>
			<div class="mt-4 flex w-full cursor-pointer flex-col items-center justify-center gap-2">
				${baseButton(t("seeMoreGames"), "data-link href=/history/" + userData.user.username)}
			</div>
		</div>
	`

	const content = /* HTML */ `
		<section class="flex gap-5 text-sm">
			<article class="medium-size container">${statInsightsHTML}</article>
			<article class="medium-size container">${historyInsightsHTML}</article>
		</section>
	`

	return content
}
