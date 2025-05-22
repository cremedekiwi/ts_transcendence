import { App } from "../../classes/App.js"
import { renderGameboard } from "../pong/pong.js"
import { renderTournamentLobby } from "./tournament_lobby.js"

export function renderTournamentGame(app: App) {
	const game = app.tournament?.currentGame
	if (!game) return renderTournamentLobby(app) // Just in case

	renderGameboard(app, game)
}
