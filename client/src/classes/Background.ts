import { EASY_BOT } from "../types/player.js"
import { App } from "./App.js"
import Game from "./Game/Game.js"
// import Game from "./Game/Game.js"

export default class Background {
	private root: HTMLElement
	private canvas: HTMLCanvasElement
	public game: Game

	constructor(private app: App) {
		// Create the root element
		this.root = document.createElement("div")
		this.root.id = "background"
		this.root.className = "absolute left-0 w-full pointer-events-none center flex flex-col"

		// Create the background canvas
		this.canvas = document.createElement("canvas")

		// Append the canvas to the body
		this.root.appendChild(this.canvas)
		document.body.appendChild(this.root)

		// Initialize the game
		this.game = new Game(this.app)
		this.game.setPlayer(1, EASY_BOT)
		this.game.setPlayer(2, EASY_BOT)
		this.game.player1Ready = true
		this.game.updateCurrentStep()
		this.game.options.ballSpeed = 10
		this.game.options.ballAcceleration = 0
		this.game.options.maxScore = 99999999
	}

	render() {
		this.root.style.top = this.app.navbar.root.clientHeight - 1 + "px"
		this.root.style.height = `${window.innerHeight - this.app.navbar.root.clientHeight - 1}px`
	}

	// Show the background (start drawing)
	show() {
		this.root.classList.remove("hidden")
		this.root.classList.add("flex")
		this.app.content.root.classList.add("relative", "z-10", "backdrop-blur-sm")
		this.game.renderer.setCanvas(this.canvas)
	}

	// Hide the background (stop drawing)
	hide() {
		this.root.classList.add("hidden")
		this.app.content.root.classList.remove("backdrop-blur-sm")
		this.game.renderer.unsetCanvas()
	}
}
