import { App } from "../../classes/App.js"
import Game from "../../classes/Game/Game.js"
import { GameOptions } from "../../types/options.js"
import { User } from "../../types/user.js"
import { updateGameButtons } from "./buttons.js"
import { updateGamePlayers } from "./players.js"

export function getGameboardELEM(): HTMLElement {
	const pongLobby = document.createElement("div")
	pongLobby.classList.add("flex", "w-fit", "flex-col")
	pongLobby.innerHTML = /* HTML */ `
		<div id="gamePlayers" class="mb-4 grid grid-cols-3"></div>
		<canvas id="gameCanvas"></canvas>
		<div id="gameButtons" class="mt-2 flex justify-between"></div>
	`

	return pongLobby
}

export function renderGameboard(app: App, game: Game) {
	const pongLobby = getGameboardELEM()
	app.hideBackground()
	app.changeContent(pongLobby)

	// Setup UI
	updateGamePlayers(game)
	game.renderer.setCanvas(pongLobby.querySelector("#gameCanvas") as HTMLCanvasElement)
	updateGameButtons(game)
}

export async function pongRenderer(app: App) {
	// Retrieve game from the server if there is one
	if (!app.game) {
		await app.server.gameStateRequest()
	}
	// Double check
	if (!app.game) {
		app.game = new Game(app)
	}

	// Render the game
	renderGameboard(app, app.game)
}

export function joinLobby(app: App, user: User, options: GameOptions) {
	app.game = new Game(app)
	app.game.setPlayer(1, { type: "remote", user })
	app.game.setPlayer(2, { type: "remote", user: app.loggedUser! })
	app.game.player2Joined = true
	app.game.options = options
	app.game.currentStep = "not-ready"
	app.game.state.reset()
	app.websocket.acceptGameInvite()
	pongRenderer(app)
}
