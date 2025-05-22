import { App } from "../../classes/App.js"
import Game from "../../classes/Game/Game.js"
import { Tournament } from "../../classes/Tournament.js"
import { baseButton } from "../../components/buttons.js"
import { t } from "../../translations/translations.js"
import { getPlayerName } from "../pong/players.js"
import { renderTournament } from "./tournament.js"
import { renderTournamentForm } from "./tournament_form.js"

function tournamentMatchupElement(game: Game): string {
	const player1 = game.player1
	const player2 = game.player2

	// Determine if there is a winner and if the player is not the winner
	const isWinner = (player: any) => game.winner && player && game.winner === player
	const isLoser = (player: any) => game.winner && player && game.winner !== player

	return /* html */ `
    <article class="bg-eerie border-purple flex w-full items-center justify-center gap-6 border-2 p-5 shadow-inner">
        <span class="font-semibold text-center ${!player1 ? "opacity-60" : ""} ${isLoser(player1) ? "line-through text-gray-500" : ""}">${getPlayerName(player1, "?")}</span>
		<span>${game.winner ? `${game.state.score1}` : ""}</span>
        <div class="${!player1 && !player2 ? "opacity-60" : ""}">
		<img src="/assets/images/versus.png" alt="VS" class="w-8 transform transition-transform duration-300 hover:scale-110" />
		<div class="bg-violet opacity-40 blur"></div>
        </div>
		<span>${game.winner ? `${game.state.score2}` : ""}</span>
        <span class="font-semibold ${!player2 ? "opacity-60" : ""} ${isLoser(player2) ? "line-through text-gray-500" : ""}">${getPlayerName(player2, "?")}</span>
    </article>
    `
}

function tournamentLobbyHTML(tournament: Tournament): string {
	return /*HTML*/ `
		<section class="large-size center from-eerie to-purple container h-full w-full gap-6 bg-gradient-to-b p-8 text-xl text-white shadow-2xl">
		<h2>${t("demi")}</h2>
			${tournamentMatchupElement(tournament.games[0])}
			${tournamentMatchupElement(tournament.games[1])}
			<h2>${t("final")}</h2>
			${tournamentMatchupElement(tournament.games[2])}
			<div class="flex gap-6">
			${baseButton("PLAY", "id='play-btn' class='neon-play text-center text-2xl font-bold py-4 w-40'")}
			${baseButton("RESET", "id='cancel-btn' class='bg-purple border-4 border-berry text-xl font-bold py-4 w-40'")}
			</div>
		</section>
	`
}

function initButtonEvents(app: App) {
	app.content.root.querySelector("#play-btn")?.addEventListener("click", () => {
		app.tournament!.startNextGame()
		renderTournament(app)
	})
	app.content.root.querySelector("#cancel-btn")?.addEventListener("click", () => {
		app.tournament = undefined
		renderTournament(app)
	})
}

export function renderTournamentLobby(app: App) {
	if (!app.tournament) return renderTournamentForm(app) // Just in case

	app.tournament.checkWinners()

	app.hideBackground()
	app.changeContent(tournamentLobbyHTML(app.tournament))
	initButtonEvents(app)
}
