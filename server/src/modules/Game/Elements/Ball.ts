import Game from "../Game.js"
import { Paddle } from "./Paddle.js"

export class Ball {
	// Ball
	public x: number = 0
	public y: number = 0
	public radius: number = 0

	// Movement
	public dx: number = 0
	public dy: number = 0
	public speed: number = 0

	constructor(public game: Game) {
		this.setInitialState()
	}

	// Ensures the ball stays within the canvas bounds
	public constrain() {}

	// Resets the paddle to its initial position
	public setInitialState() {
		// Using game options
		this.x = Game.WIDTH / 2
		this.y = Game.HEIGHT / 2
		this.radius = this.game.options.ballRadius
		this.speed = this.game.options.ballSpeed
		this.dx = 0
		this.dy = 0
	}

	public launch() {
		// Randomize initial trajectory
		this.dx = Math.random() < 0.5 ? -1 : 1 // 50% chance left or right
		this.dy = (Math.random() - 0.5) * 2 // Random angle between -1 and 1
		// console.log("Launched at ", this.dx, ",", this.dy)
	}

	// Updates the ball's position
	// Only if the game is running
	public update() {
		if (this.game.currentStep != "playing") return
		if (this.dx === 0) this.launch()

		// console.log("Ball :", this)

		this.x += this.dx * this.speed
		this.y += this.dy * this.speed

		// Bounce off the top and bottom edges
		if (this.y - this.radius < 0 || this.y + this.radius > Game.HEIGHT) {
			this.dy *= -1
		}

		// Bounce off the paddles
		this.checkPaddleCollision(this.game.state.paddle1)
		this.checkPaddleCollision(this.game.state.paddle2)

		// Check for scoring and reset the ball
		if (this.x - this.radius < 0) {
			this.game.state.addPoint(2)
			this.setInitialState()
		} else if (this.x + this.radius > Game.WIDTH) {
			this.game.state.addPoint(1)
			this.setInitialState()
		}
	}

	// Increases the ball's speed
	public increaseSpeed() {
		this.speed += this.game.options.ballAcceleration
	}

	// Checks and handles collision with a paddle
	private checkPaddleCollision(paddle: Paddle) {
		// Check if the ball is within the paddle's horizontal and vertical bounds
		if (
			this.x - this.radius < paddle.x + Game.PADDLE_WIDTH &&
			this.x + this.radius > paddle.x &&
			this.y + this.radius > paddle.y &&
			this.y - this.radius < paddle.y + paddle.height
		) {
			// Reverse the horizontal velocity
			this.dx *= -1

			// Adjust the ball's position to prevent sticking
			if (this.x < paddle.x) {
				this.x = paddle.x - this.radius // Place the ball to the left of the paddle
			} else {
				this.x = paddle.x + Game.PADDLE_WIDTH + this.radius // Place the ball to the right of the paddle
			}

			// Calculate angle based on impact point relative to paddle center
			const paddleCenter = paddle.y + paddle.height / 2
			const collisionPoint = this.y - paddleCenter
			// Normalize to range of -1 to 1 (top to bottom of paddle)
			const normalizedCollision = collisionPoint / (paddle.height / 2)
			this.dy = normalizedCollision * 1.5

			this.increaseSpeed()
		}
	}
}
