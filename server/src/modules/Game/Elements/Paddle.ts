import Game from "../Game.js"

export class Paddle {
	public x: number = 0
	public y: number = 0
	public height: number = 0
	public speed: number = 0

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
	}

	// Updates the paddle position without any input
	public updateBot() {
		const ball = this.game.state.ball

		// Check if the ball is moving towards the paddle
		if (this.isOnTheLeft) {
			if (ball.dx > 0) return
		} else {
			if (ball.dx < 0) return
		}

		const paddleCenter = this.y + this.height / 2

		// Define a dead zone to avoid jittery movements
		const deadZone = this.height * 0.2 // 20% of the paddle's height

		if (ball.y < paddleCenter - deadZone) {
			this.moveUp()
		} else if (ball.y > paddleCenter + deadZone) {
			this.moveDown()
		}
	}
}
