import { updateGameButtons } from "../../content/pong/buttons.js"
import { Ball } from "./Elements/Ball.js"
import { Paddle } from "./Elements/Paddle.js"
import Game from "./Game.js"

export default class GameState {
	public score1: number = 0
	public score2: number = 0
	public paddle1: Paddle
	public paddle2: Paddle
	public ball: Ball

	constructor(public game: Game) {
		this.paddle1 = new Paddle(this.game, true)
		this.paddle2 = new Paddle(this.game, false)
		this.ball = new Ball(this.game)
	}

	reset() {
		this.paddle1.setInitialState()
		this.paddle2.setInitialState()
		this.ball.setInitialState()
		this.score1 = 0
		this.score2 = 0
	}

	update() {
		if (this.game.currentStep != "playing") return
		this.game.inputs.update() // Handle player inputs
		this.ball.update() // Handle ball direction
		this.updateBots() // Move the paddles if they are bots
	}

	addPoint(playerNumber: number) {
		if (playerNumber === 1) {
			this.score1++
			if (this.score1 >= this.game.options.maxScore) this.setWinner(1)
		} else if (playerNumber === 2) {
			this.score2++
			if (this.score2 >= this.game.options.maxScore) this.setWinner(2)
		}
		this.ball.setInitialState()
	}

	setWinner(playerNumber: number) {
		if (playerNumber === 1) this.game.winner = this.game.player1
		else if (playerNumber === 2) this.game.winner = this.game.player2
		this.game.currentStep = "done"
		updateGameButtons(this.game)
	}

	updateBots() {
		if (this.game.currentStep != "playing") return
		if (this.game.player1?.type === "bot") this.paddle1.updateBot(this.game.player1.difficulty)
		if (this.game.player2?.type === "bot") this.paddle2.updateBot(this.game.player2.difficulty)
	}
}
