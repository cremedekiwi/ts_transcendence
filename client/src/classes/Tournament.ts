import { BotPlayer, LocalPlayer } from "../types/player.js"
import { App } from "./App.js"
import Game from "./Game/Game.js"

export type TournamentPlayer = LocalPlayer | BotPlayer

export class Tournament {
	public app: App
	public players: TournamentPlayer[] = []
	public games: Game[] = []
	public currentGame?: Game

	constructor(app: App, players: TournamentPlayer[]) {
		if (players.length !== 4) {
			throw new Error("Tournament must have exactly 4 players.")
		}
		this.app = app
		this.games = [this.createGame(players[0], players[1]), this.createGame(players[2], players[3]), this.createGame()]
		this.players = players
		this.randomMatchmaking()
	}

	private createGame(player1?: TournamentPlayer, player2?: TournamentPlayer) {
		const game = new Game(this.app)
		game.gameMode = "tournament"
		game.currentStep = "not-ready"
		game.setPlayer(1, player1)
		game.setPlayer(2, player2)
		return game
	}

	// Randomly pair players for the first round
	private randomMatchmaking() {
		this.players = this.players.sort(() => Math.random() - 0.5)

		this.games[0].setPlayer(1, this.players[0])
		this.games[0].setPlayer(2, this.players[1])
		this.games[1].setPlayer(1, this.players[2])
		this.games[1].setPlayer(2, this.players[3])
	}

	public checkWinners() {
		this.games[2].setPlayer(1, this.games[0].winner)
		this.games[2].setPlayer(2, this.games[1].winner)
	}

	public startNextGame() {
		let game: Game | undefined = undefined
		if (!this.games[0].winner) game = this.games[0]
		else if (!this.games[1].winner) game = this.games[1]
		else if (!this.games[2].winner) game = this.games[2]
		this.currentGame = game
	}
}
