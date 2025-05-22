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
		//console.log("Launched at ", this.dx, ",", this.dy)
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
		if (this.y - this.radius < 0) {
			this.dy *= -1
			this.y = this.radius // Reposition the ball to be exactly at the top edge
		} else if (this.y + this.radius > Game.HEIGHT) {
			this.dy *= -1
			this.y = Game.HEIGHT - this.radius // Reposition the ball to be exactly at the bottom edge
		}

		// Bounce off the paddles
		this.checkPaddleCollision(this.game.state.paddle1)
		this.checkPaddleCollision(this.game.state.paddle2)

		// Check for scoring and reset the ball
		if (this.x + this.radius < 0) {
			this.game.state.addPoint(2)
			this.setInitialState()
		} else if (this.x - this.radius > Game.WIDTH) {
			this.game.state.addPoint(1)
		}
	}

	// Increases the ball's speed
	public increaseSpeed() {
		this.speed += this.game.options.ballAcceleration
	}

	// Checks and handles collision with a paddle
	private checkPaddleCollision(paddle: Paddle) {
		const prevX = this.x - this.dx * this.speed
		const prevY = this.y - this.dy * this.speed
		const paddleLeft = paddle.x
		const paddleRight = paddle.x + Game.PADDLE_WIDTH
		const paddleTop = paddle.y
		const paddleBottom = paddle.y + paddle.height

		// Determine which side to check
		let collideX, paddleXEdge
		if (this.dx < 0) {
			collideX = paddleRight + this.radius
			paddleXEdge = paddleRight
		} else if (this.dx > 0) {
			collideX = paddleLeft - this.radius
			paddleXEdge = paddleLeft
		} else {
			return // Not moving horizontally
		}

		// Check if the ball crosses the paddle's x-plane this frame
		const crossed = (this.dx < 0 && prevX >= collideX && this.x <= collideX) || (this.dx > 0 && prevX <= collideX && this.x >= collideX)

		if (crossed) {
			// Linear interpolation to find y at collision
			const t = (collideX - prevX) / (this.x - prevX)
			const yAtCollision = prevY + (this.y - prevY) * t
			if (yAtCollision + this.radius > paddleTop && yAtCollision - this.radius < paddleBottom) {
				this.x = collideX
				this.dx *= -1
				const paddleCenter = paddle.y + paddle.height / 2
				const collisionPoint = yAtCollision - paddleCenter
				const normalizedCollision = collisionPoint / (paddle.height / 2)
				this.dy = normalizedCollision * 0.75
				this.increaseSpeed()
			}
		} else if (
			// Fallback: still overlapping
			this.x - this.radius < paddleRight &&
			this.x + this.radius > paddleLeft &&
			this.y + this.radius > paddleTop &&
			this.y - this.radius < paddleBottom
		) {
			this.dx *= -1
			const paddleCenter = paddle.y + paddle.height / 2
			const collisionPoint = this.y - paddleCenter
			const normalizedCollision = collisionPoint / (paddle.height / 2)
			this.dy = normalizedCollision * 0.75
			this.increaseSpeed()
		}
	}
}
