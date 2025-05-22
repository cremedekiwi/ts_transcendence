import { difficultyType } from "../../../types/player.js"
import Game from "../Game.js"

const difficultyConfig: Record<difficultyType, { interval: number; predictsRebound: boolean; onlyWhenBallIsComing: boolean }> = {
	easy: { interval: 0, predictsRebound: false, onlyWhenBallIsComing: true },
	medium: { interval: 1000, predictsRebound: true, onlyWhenBallIsComing: true },
	hard: { interval: 1000, predictsRebound: true, onlyWhenBallIsComing: false },
	extreme: { interval: 200, predictsRebound: true, onlyWhenBallIsComing: false },
}

export class Paddle {
	public x: number = 0
	public y: number = 0
	public height: number = 0
	public speed: number = 0
	private lastAIUpdate: number = 0 // Timestamp of last AI update
	public aiPredictedY: number | null = null // Last predicted Y position for AI

	constructor(
		public game: Game,
		public isOnTheLeft: boolean = true,
	) {
		this.setInitialState()
	}

	// Moves the paddle up
	public moveUp() {
		this.y -= this.speed
		this.constrain()
	}

	// Moves the paddle down
	public moveDown() {
		this.y += this.speed
		this.constrain()
	}

	// Ensures the paddle stays within the canvas bounds
	public constrain() {
		if (this.y < 0) this.y = 0
		if (this.y + this.height > Game.HEIGHT) this.y = Game.HEIGHT - this.height
	}

	// Resets the paddle to its initial position
	public setInitialState() {
		// Using game options
		this.height = this.game.options.paddleSize
		this.speed = this.game.options.paddleSpeed
		this.x = this.isOnTheLeft ? Game.PADDLE_SPACE : Game.WIDTH - Game.PADDLE_WIDTH - Game.PADDLE_SPACE
		this.y = Game.HEIGHT / 2 - this.height / 2
		this.lastAIUpdate = 0
		this.aiPredictedY = null
	}

	public updateBot(difficulty: difficultyType) {
		this.updateAIPrediction(difficulty)
		this.moveAIPaddle()
	}

	// Updates the predicted Y position of the ball depending on the difficulty level
	public updateAIPrediction(difficulty: difficultyType) {
		const now = Date.now()
		const ball = this.game.state.ball
		const gameHeight = Game.HEIGHT
		const paddleX = this.isOnTheLeft ? this.x + Game.PADDLE_WIDTH : this.x
		const opponentPaddle = this.isOnTheLeft ? this.game.state.paddle2 : this.game.state.paddle1

		const config = difficultyConfig[difficulty]
		const isBallComingToward = (this.isOnTheLeft && ball.dx < 0) || (!this.isOnTheLeft && ball.dx > 0)

		if (config.onlyWhenBallIsComing && !isBallComingToward) {
			return
		}
		if (now - this.lastAIUpdate < config.interval) {
			return
		}
		this.lastAIUpdate = now

		if (!config.predictsRebound) {
			this.aiPredictedY = ball.y
			return
		}

		// Predict with rebounds
		let predictedY = ball.y
		let predictedX = ball.x
		let dx = ball.dx
		let dy = ball.dy
		let speed = ball.speed
		let iterations = 0
		const maxIterations = 2000
		let hasBouncedOnOpponent = false
		while (((this.isOnTheLeft && predictedX > paddleX) || (!this.isOnTheLeft && predictedX < paddleX)) && iterations < maxIterations) {
			predictedX += dx
			predictedY += dy
			iterations++
			if (predictedY < 0) {
				predictedY = -predictedY
				dy = -dy
			}
			if (predictedY > gameHeight) {
				predictedY = 2 * gameHeight - predictedY
				dy = -dy
			}
			if (!hasBouncedOnOpponent) {
				const oppLeft = opponentPaddle.x
				const oppRight = opponentPaddle.x + Game.PADDLE_WIDTH
				const oppTop = opponentPaddle.y
				const oppBottom = opponentPaddle.y + opponentPaddle.height
				const willHitOpponent =
					predictedX - ball.radius < oppRight &&
					predictedX + ball.radius > oppLeft &&
					predictedY + ball.radius > oppTop &&
					predictedY - ball.radius < oppBottom
				if (willHitOpponent) {
					dx *= -1
					const paddleCenter = opponentPaddle.y + opponentPaddle.height / 2
					const collisionPoint = predictedY - paddleCenter
					const normalizedCollision = collisionPoint / (opponentPaddle.height / 2)
					dy = normalizedCollision * 1.5
					speed += this.game.options.ballAcceleration
					hasBouncedOnOpponent = true
				}
			}
		}
		if (iterations === maxIterations) {
			predictedY = ball.y
		}
		this.aiPredictedY = predictedY
	}

	// Moves the paddle toward the last predicted Y position every frame.
	public moveAIPaddle() {
		const paddleCenter = this.y + this.height / 2
		const deadZone = this.height * 0.2

		if (this.aiPredictedY !== null) {
			if (this.aiPredictedY < paddleCenter - deadZone) {
				this.moveUp()
			} else if (this.aiPredictedY > paddleCenter + deadZone) {
				this.moveDown()
			}
		}
	}
}
