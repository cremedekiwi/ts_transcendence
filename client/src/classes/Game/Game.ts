import { updateGamePlayers } from "../../content/pong/players.js"
import { GameOptions } from "../../types/options.js"
import { DEFAULT_LOCAL_1, Player, RemotePlayer } from "../../types/player.js"
import { GameStateReply } from "../../types/websocket.js"
import { App } from "../App.js"
import { optionsManager } from "../Options.js"
import { GameInputs } from "./GameInputs.js"
import GameRenderer from "./GameRenderer.js"
import GameState from "./GameState.js"

export type currentStepType = "configuring" | "waiting-for-opponent" | "not-ready" | "playing" | "pause" | "done" | "cancelled"
export type gameMode = "local" | "remote" | "tournament" // | "spectator"

export default class Game {
	// Constants
	static WIDTH: number = 1216
	static HEIGHT: number = Game.WIDTH / (16 / 9)
	static PADDLE_SPACE: number = 0
	static PADDLE_WIDTH: number = 20

	// Players
	public player1?: Player
	public player2?: Player
	public player1Ready: boolean = false
	public player2Joined?: boolean = false
	public player2Ready: boolean = false
	public winner?: Player

	// Game config
	public currentStep: currentStepType = "configuring"
	public gameMode: gameMode = "local"
	public options: GameOptions = optionsManager.getOptions()
	public renderer: GameRenderer = new GameRenderer(this)
	public state: GameState = new GameState(this)
	public inputs: GameInputs = new GameInputs(this)

	constructor(public app: App) {
		this.setInitialPlayer()
		this.gameLoop()
	}

	// Update the game players and their UI in /pong
	setPlayer(number: number, player?: Player) {
		if (number === 1) {
			this.player1 = player
			this.player1Ready = false
		} else if (number === 2) {
			this.player2 = player
			this.player2Joined = false
			this.player2Ready = false
			// Automatically set as ready bots/local players
			if (player?.type === "remote") {
				this.gameMode = "remote"
			} else if (player) {
				this.gameMode = this.gameMode === "tournament" ? "tournament" : "local"
				this.player2Joined = true
				this.player2Ready = true
			}
		}
		// Update the game players in the UI
		updateGamePlayers(this)
	}

	// Set the game options to be the same as the ones in the OptionsManager
	updateOptions() {
		this.options = optionsManager.getOptions()
		this.state.reset()
		//console.log("Game options updated:", this.options)
	}
	private isLoopRunning = false
	// Main game loop
	private gameLoop() {
		if (!this.isLoopRunning) this.isLoopRunning = true
		// console.log("Current step : ", this.currentStep)
		this.renderer.clearCanvas() // Clear the canvas at the start of each frame

		this.state.update() // Update game state

		this.renderer.render() // Render the game

		requestAnimationFrame(() => this.gameLoop())
	}
	// Update the current step based on the data inside the game
	public updateCurrentStep() {
		this.currentStep = "configuring"
		if (!this.player1 || !this.player2) return

		this.currentStep = "waiting-for-opponent"
		if (!this.player2Joined) return

		this.currentStep = "not-ready"
		if (!this.player1Ready || !this.player2Ready) return

		if (this.winner) this.currentStep = "done"
		else {
			this.currentStep = "playing"
		}
	}

	public toggleReadyState() {
		if (this.currentStep !== "not-ready") return

		// Determine the player depending on the game mode
		if (this.gameMode !== "remote") {
			this.player1Ready = !this.player1Ready
			return
		}

		// If the game is remote, check which player is logged in
		if (this.app.loggedUser?.id === (this.player1 as RemotePlayer).user.id) {
			this.player1Ready = !this.player1Ready // Update locally
			this.app.websocket.updateReadyState(this.player1Ready) // Update the server
			console.warn("Player 1 ready: ", this.player1Ready)
		} else if (this.app.loggedUser?.id === (this.player2 as RemotePlayer).user.id) {
			this.player2Ready = !this.player2Ready // Update locally
			this.app.websocket.updateReadyState(this.player2Ready) // Update the server
			console.warn("Player 2 ready: ", this.player2Ready)
		}
	}

	// Reset the game but keep the configuration
	public resetGame() {
		this.state.reset()
		this.currentStep = "configuring"
		this.winner = undefined
		let player1 = this.player1
		let player2 = this.player2
		// If restarting a remote game, place the logged user as player 1 if he was player 2
		if (this.gameMode === "remote") {
			if (this.app.loggedUser?.id === (this.player2 as RemotePlayer).user.id) {
				player1 = this.player2
				player2 = this.player1
			}
		}
		this.setPlayer(1, player1)
		this.setPlayer(2, player2)
		if (!this.gameLoop) this.gameLoop()
	}

	// Set initial player depending on logged state
	public setInitialPlayer() {
		this.setPlayer(1, this.app.loggedUser ? { type: "remote", user: this.app.loggedUser } : DEFAULT_LOCAL_1)
	}

	// Empty the cache for the remote matches so the game is fetched from the server in profil/history/stats page
	private updateCache() {
		if (this.currentStep !== "done" || this.gameMode !== "remote") return
		this.app.cache.clearMatches((this.player1 as RemotePlayer).user.username)
		this.app.cache.clearMatches((this.player2 as RemotePlayer).user.username)
	}

	// Cancel a game
	public cancelGame() {
		// Send the cancelation to the server if it's a remote game
		if (this.gameMode === "remote") {
			if (this.player2Joined) this.app.websocket.cancelGame()
			else this.app.websocket.cancelInvite()
		}
		this.state.reset()
		this.setInitialPlayer()
		this.setPlayer(2, undefined)
		this.winner = undefined
		this.currentStep = "configuring"
	}
}

export function newGameFromStateReply(app: App, reply: GameStateReply) {
	console.log("Creating new game from state reply")
	const game = new Game(app)
	const player1 = app.cache.getUser(reply.player1.id)?.user
	const player2 = app.cache.getUser(reply.player2.id)?.user
	if (!player1 || !player2) return

	game.setPlayer(1, { type: "remote", user: player1 })
	game.setPlayer(2, { type: "remote", user: player2 })
	game.player2Joined = true
	game.gameMode = "remote"
	return game
}
