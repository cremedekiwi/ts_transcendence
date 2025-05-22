import Game from "./Game.js"

export class GameInputs {
	static TRACKED_KEYS: string[] = ["w", "s", "ArrowUp", "ArrowDown"] // List of keys to track
	private keys: { [key: string]: boolean } = {} // Tracks the state of keys

	constructor(private game: Game) {
		this.initialize()
	}

	// Initializes input listeners
	public initialize() {
		window.addEventListener("keydown", (event) => this.handleKeyDown(event))
		window.addEventListener("keyup", (event) => this.handleKeyUp(event))
	}

	// Handles keydown events
	private handleKeyDown(event: KeyboardEvent) {
		if (!GameInputs.TRACKED_KEYS.includes(event.key)) return // Ignore untracked keys
		this.keys[event.key] = true // Mark the key as pressed

		// Send the key event to the server
		if (this.game.currentStep === "playing" && this.game.gameMode === "remote") {
			this.game.app.websocket.sendKeyEvent(event.key, true)
		}
	}

	// Handles keyup events
	private handleKeyUp(event: KeyboardEvent) {
		if (!GameInputs.TRACKED_KEYS.includes(event.key)) return // Ignore untracked keys
		this.keys[event.key] = false // Mark the key as released

		// Send the key event to the server
		if (this.game.currentStep === "playing" && this.game.gameMode === "remote") {
			this.game.app.websocket.sendKeyEvent(event.key, false)
		}
	}

	// Updates paddle movement based on game mode and key states
	public update() {
		// Don't update if the game is not running
		if (this.game.currentStep !== "playing") return

		// Handle inputs based on game mode
		if (this.game.gameMode === "local" || this.game.gameMode === "tournament") {
			this.handleLocalInputs()
		} else if (this.game.gameMode === "remote") {
			this.handleRemoteInputs()
		}
	}

	// Handles inputs for local game mode
	private handleLocalInputs() {
		const player1IsHuman = this.game.player1?.type !== "bot"
		const player2IsHuman = this.game.player2?.type !== "bot"

		let leftPaddle = null
		let rightPaddle = null

		if (player1IsHuman && !player2IsHuman) {
			leftPaddle = rightPaddle = this.game.state.paddle1
		} else if (!player1IsHuman && player2IsHuman) {
			leftPaddle = rightPaddle = this.game.state.paddle2
		} else {
			leftPaddle = player1IsHuman ? this.game.state.paddle1 : null
			rightPaddle = player2IsHuman ? this.game.state.paddle2 : null
		}

		if (this.keys["w"]) leftPaddle?.moveUp()
		if (this.keys["s"]) leftPaddle?.moveDown()
		if (this.keys["ArrowUp"]) rightPaddle?.moveUp()
		if (this.keys["ArrowDown"]) rightPaddle?.moveDown()
	}

	// Handles inputs for remote game mode
	private handleRemoteInputs() {
		if (this.game.player1?.type !== "remote" || this.game.player2?.type !== "remote") return

		// Control the left or right paddle based on the logged-in user
		const paddle = this.game.app.loggedUser!.id === this.game.player1?.user.id ? this.game.state.paddle1 : this.game.state.paddle2
		if (this.keys["w"]) {
			paddle.moveUp()
		}
		if (this.keys["s"]) {
			paddle.moveDown()
		}
		if (this.keys["ArrowUp"]) {
			paddle.moveUp()
		}
		if (this.keys["ArrowDown"]) {
			paddle.moveDown()
		}
	}
}
