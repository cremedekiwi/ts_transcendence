import { getPlayerName } from "../../content/pong/players.js"
import { t } from "../../translations/translations.js"
import { Paddle } from "./Elements/Paddle.js"
import Game from "./Game.js"

export default class GameRenderer {
	public canvas?: HTMLCanvasElement
	public ctx?: CanvasRenderingContext2D
	private ballColor: string = "#C10BD9"
	private paddleColor: string = "#C10BD9"
	private borderColor: string = "#C10BD9"

	constructor(public game: Game) {}

	setCanvas(canvas: HTMLCanvasElement) {
		this.canvas = canvas
		this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D
		canvas.width = Game.WIDTH
		canvas.height = Game.HEIGHT
	}

	unsetCanvas() {
		this.clearCanvas()
		this.canvas = undefined
		this.ctx = undefined
	}

	// Clears the canvas
	public clearCanvas() {
		if (!this.ctx || !this.canvas) return
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
	}

	render() {
		if (!this.ctx || !this.canvas) return

		// Draw border
		this.drawBorder()

		// Draw paddles
		this.drawPaddles()

		// Draw predicted ball for both paddles (if AI)
		this.drawPredictedBall(this.game.state.paddle1)
		this.drawPredictedBall(this.game.state.paddle2)

		// Draw ball
		this.drawBall()

		// Draw score
		this.drawScore()

		this.drawDottedLine()

		// Draw overlay
		this.drawOverlay()
	}

	drawBorder() {
		if (!this.ctx || !this.canvas) return

		this.ctx.strokeStyle = this.borderColor
		this.ctx.lineWidth = 2
		this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height)
	}

	// NOTE: Draws depending on the game state and the config
	drawPaddles() {
		if (!this.ctx || !this.canvas) return
		this.ctx.fillStyle = this.paddleColor
		this.ctx.fillRect(this.game.state.paddle1.x, this.game.state.paddle1.y, Game.PADDLE_WIDTH, this.game.options.paddleSize)
		this.ctx.fillRect(this.game.state.paddle2.x, this.game.state.paddle2.y, Game.PADDLE_WIDTH, this.game.options.paddleSize)
	}

	// NOTE: Draws a ball outline at the predicted Y position if there is one
	drawPredictedBall(paddle: Paddle) {
		if (!this.ctx || !this.canvas) return
		if (paddle.aiPredictedY === null) return
		this.ctx.save()
		this.ctx.strokeStyle = "grey"
		this.ctx.lineWidth = 2
		this.ctx.setLineDash([4, 4])
		this.ctx.beginPath()
		let x
		if (paddle.isOnTheLeft) {
			x = paddle.x + Game.PADDLE_WIDTH + this.game.options.ballRadius
		} else {
			x = paddle.x - this.game.options.ballRadius
		}
		this.ctx.arc(x, paddle.aiPredictedY, this.game.state.ball.radius, 0, 2 * Math.PI)
		this.ctx.stroke()
		this.ctx.setLineDash([])
		this.ctx.restore()
	}

	// NOTE: Draws depending on the game state and the config
	drawBall() {
		if (!this.ctx || !this.canvas) return
		this.ctx.fillStyle = this.ballColor
		this.ctx.beginPath()
		this.ctx.arc(this.game.state.ball.x, this.game.state.ball.y, this.game.state.ball.radius, 0, 2 * Math.PI)
		this.ctx.fill()
		this.ctx.closePath()
	}

	// NOTE: Draws the gamestate score
	drawScore() {
		if (!this.ctx || !this.canvas) return

		this.ctx.font = "42px anonymous"
		this.ctx.fillStyle = "#FFFFFF"
		this.ctx.textAlign = "center"
		this.ctx.fillText(`${this.game.state.score1}    ${this.game.state.score2}`, this.canvas.width / 2, 50)
	}

	drawDottedLine() {
		if (!this.ctx || !this.canvas) return

		// Calculate center X position
		const lineX = this.canvas.width / 2

		// Dash and gap sizes
		const dashHeight = 17
		const gapHeight = 8

		// Set line appearance
		this.ctx.strokeStyle = "#C10BD9"
		this.ctx.lineWidth = 2

		// Start a new path for the dotted line
		this.ctx.beginPath()

		// Draw series of dashes from top to bottom
		for (let y = dashHeight / 2; y < this.canvas.height; y += dashHeight + gapHeight) {
			// Handle case where last dash would exceed canvas height
			const currentDashHeight = Math.min(dashHeight, this.canvas.height - y)
			if (currentDashHeight <= 0) break

			// Draw a single dash segment
			this.ctx.moveTo(lineX, y)
			this.ctx.lineTo(lineX, y + currentDashHeight)
		}

		// Render all dash segments
		this.ctx.stroke()
	}

	drawOverlay() {
		if (!this.ctx || !this.canvas) return

		let message: string
		switch (this.game.currentStep) {
			case "configuring":
				message = t("configuring")
				break
			case "waiting-for-opponent":
				message = t("waitingForOpponent")
				break
			case "not-ready":
				message = t("notReady")
				break
			case "pause":
				message = t("paused")
				break
			case "done":
				message = `${getPlayerName(this.game.winner)} ${t("won")}`
				break
			case "cancelled":
				message = t("gameCancelled")
				break
			default:
				return
		}

		this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

		// Calculate text metrics to size the rectangle properly
		this.ctx.font = "30px Arial"
		const textMetrics = this.ctx.measureText(message)
		const textWidth = textMetrics.width
		const textHeight = 30

		// Draw rectangle behind text
		this.ctx.fillStyle = "#110413"
		this.ctx.fillRect(this.canvas.width / 2 - textWidth / 2 - 10, this.canvas.height / 4 - textHeight - 5, textWidth + 20, textHeight + 30)

		this.ctx.fillStyle = "#FFFFFF"
		this.ctx.textAlign = "center"
		this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 4)
	}
}
