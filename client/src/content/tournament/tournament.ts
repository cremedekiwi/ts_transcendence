import { App } from "../../classes/App.js"
import { Tournament } from "../../classes/Tournament.js"
import { baseButton } from "../../components/buttons.js"
import { t } from "../../translations/translations.js"
import { getPlayerName } from "../pong/players.js"
import { renderTournamentForm } from "./tournament_form.js"
import { renderTournamentGame } from "./tournament_game.js"
import { renderTournamentLobby } from "./tournament_lobby.js"

// Render the tournament page based on the current round
export function renderTournament(app: App) {
	if (!app.tournament) {
		renderTournamentForm(app)
	} else if (app.tournament.currentGame) {
		renderTournamentGame(app)
	} else if (app.tournament.games[2].winner) {
		renderWinner(app)
	} else {
		renderTournamentLobby(app)
	}
}

function tournamentLobbyHTML(tournament: Tournament): string {
	const winnerName = getPlayerName(tournament.games[2]?.winner) || t("unknown")

	return /*HTML*/ `
        <section class="large-size center from-eerie to-purple container h-full w-full bg-gradient-to-b p-8 text-xl text-white shadow-2xl relative overflow-hidden flex flex-col items-center">
            <img src="/assets/images/winningTournament.png" alt="Trophée"
                class="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none" />
            <div class="relative z-10 flex flex-col items-center h-full w-full">
                <h2 class="text-4xl md:text-6xl font-bold drop-shadow-lg tracking-widest mt-10 mb-4 self-center" style="margin-top: 0; margin-bottom: 0; flex: 0 0 15%;">${t("youWin")}</h2>
                <h1 class="text-5xl md:text-7xl font-extrabold drop-shadow-lg mb-4 self-center" style="flex: 0 0 10%;">${t("congrats")}</h1>
                <div class="text-3xl md:text-4xl font-semibold mb-8 self-center">${winnerName}</div>
                <div class="flex-1"></div>
                <div class="mb-12 self-center">
                    ${baseButton(t("back"), "id='cancel-btn' class='bg-purple border-4 border-berry text-xl font-bold py-4 w-40'")}
                </div>
            </div>
        </section>
    `
}

export function renderWinner(app: App) {
	if (!app.tournament) return renderTournamentForm(app) // Just in case

	app.hideBackground()
	app.changeContent(tournamentLobbyHTML(app.tournament))
	app.content.root.querySelector("#cancel-btn")?.addEventListener("click", () => {
		app.tournament = undefined
		renderTournament(app)
	})
}
