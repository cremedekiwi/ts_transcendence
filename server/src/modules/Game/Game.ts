import WebSocketManager from "../websockets/WebSocket.Manager.js"
import { GameStateReply } from "../websockets/websocket.types.js"
import { Paddle } from "./Elements/Paddle.js"
import GameState from "./GameState.js"

export interface GameOptions {
	ballSpeed: number
	ballRadius: number
	ballAcceleration: number
	paddleSpeed: number
	paddleSize: number
	maxScore: number
}
export interface KeysType {
	[key: string]: boolean
}
class GameInputs {
	static TRACKED_KEYS: string[] = ["w", "s", "ArrowUp", "ArrowDown"] // List of keys to track
	private player1keys: KeysType = {}
	private player2keys: KeysType = {}

	constructor(public game: Game) {}

	public update() {
		if (this.game.currentStep != "playing") return

		this.updatePaddleBasedOnKeys(this.game.state.paddle1, this.player1keys)
		this.updatePaddleBasedOnKeys(this.game.state.paddle2, this.player2keys)
	}

	private updatePaddleBasedOnKeys(paddle: Paddle, keys: KeysType) {
		if (keys["ArrowUp"] || keys["w"]) {
			paddle.moveUp()
		}
		if (keys["ArrowDown"] || keys["s"]) {
			paddle.moveDown()
		}
	}

	public setPlayerKey(player: number, key: string, pressed: boolean) {
		if (player === 1) {
			this.player1keys[key] = pressed
		} else if (player === 2) {
			this.player2keys[key] = pressed
		}
	}
}

export type currentStepType = "waiting-for-opponent" | "not-ready" | "playing" | "pause" | "done"

export default class Game {
	// Constants
	static WIDTH: number = 1216
	static HEIGHT: number = Game.WIDTH / (16 / 9)
	static PADDLE_SPACE: number = 0
	static PADDLE_WIDTH: number = 20

	// Players
	public player1Id: number
	public player2Id: number
	public player1Ready: boolean = false
	public player2Ready: boolean = false
	public winner?: number

	// Game config
	public currentStep: currentStepType = "not-ready"
	public options: GameOptions
	public state: GameState
	public gameInputs: GameInputs

	// Timer
	public startTime: number = 0
	public duration: number = 0

	constructor(player1: number, player2: number, options: GameOptions) {
		this.player1Id = player1
		this.player2Id = player2
		this.options = options
		this.state = new GameState(this)
		this.gameInputs = new GameInputs(this)
	}

	// Update the current step based on the data inside the game
	public updateCurrentStep() {
		this.currentStep = "not-ready"
		if (!this.player1Ready || !this.player2Ready) return

		this.currentStep = "playing"
		this.startTime = Date.now()
		if (!this.winner) return

		this.currentStep = "done"
	}

	public sendGameState() {
		WebSocketManager.sendTo(this.player1Id, this.getReply())
		WebSocketManager.sendTo(this.player2Id, this.getReply())
	}

	public getReply(): GameStateReply {
		return {
			type: "gameState",
			currentStep: this.currentStep,
			player1: {
				id: this.player1Id,
				ready: this.player1Ready,
				score: this.state.score1,
			},
			player2: {
				id: this.player2Id,
				ready: this.player2Ready,
				score: this.state.score2,
			},
			paddle1: { x: this.state.paddle1.x, y: this.state.paddle1.y },
			paddle2: { x: this.state.paddle2.x, y: this.state.paddle2.y },
			ball: {
				x: this.state.ball.x,
				y: this.state.ball.y,
				dx: this.state.ball.dx,
				dy: this.state.ball.dy,
				speed: this.state.ball.speed,
			},
			winner: this.winner,
		}
	}

	public handleKeyEvent(userId: number, key: string, pressed: boolean) {
		if (userId === this.player1Id) {
			this.gameInputs.setPlayerKey(1, key, pressed)
		} else if (userId === this.player2Id) {
			this.gameInputs.setPlayerKey(2, key, pressed)
		}
	}

	public movePaddle(userId: number, direction: "up" | "down") {
		const paddle = userId === this.player1Id ? this.state.paddle1 : this.state.paddle2
		if (direction === "up") {
			paddle.moveUp()
		} else if (direction === "down") {
			paddle.moveDown()
		}
	}
}
