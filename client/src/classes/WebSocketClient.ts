import { switchPlayerCardStatus } from "../components/player_card.js"
import { switchChatInput } from "../content/chat.js"
import { updateGameButtons } from "../content/pong/buttons.js"
import { updateGamePlayers } from "../content/pong/players.js"
import { RemotePlayer } from "../types/player.js"
import {
	CancelGameMessage,
	CancelInviteMessage,
	CancelInviteReply,
	ChatReply,
	ConnectMessage,
	ConnectReply,
	GameStateReply,
	InviteReply,
	InviteResponseMessage,
	InviteResponseReply,
	KeyEventMessage,
	LogoutMessage,
	LogoutReply,
	PingMessage,
	ReadyMessage,
	WebSocketMessage,
	WebSocketReply,
} from "../types/websocket.js"
import { App } from "./App.js"

export default class WebSocketClient {
	public ready: boolean = false
	private ws: WebSocket
	static URL = "wss://localhost:8080/ws"

	constructor(private app: App) {
		this.ws = new WebSocket(WebSocketClient.URL)
		this.connect()
	}

	/**
	 * Establishes WebSocket connection and sets up event handlers
	 */
	private connect() {
		this.ws.onopen = () => {
			// console.log("WebSocket connection established")
			this.send({ type: "ping" } as PingMessage)
			this.ready = true
		}

		this.ws.onclose = (event) => {
			console.warn("WebSocket connection closed:", event.reason)
		}

		this.ws.onerror = (error) => {
			console.error("WebSocket error:", error)
		}

		this.ws.onmessage = (event) => {
			const data = JSON.parse(event.data) as WebSocketReply
			this.handleReply(data)
		}
	}

	/**
	 * Sends a message through the WebSocket connection
	 * @param message - String or message object to send
	 */
	async send(message: WebSocketMessage) {
		while (!this.ready) {
			await new Promise((resolve) => setTimeout(resolve, 100)) // Wait 100ms
		}
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(message))
			// console.log("Websocket Sent: ", message)
		} else {
			console.warn("WebSocket is not connected yet")
		}
	}

	/**
	 * Establishes a websocket connection for the current user and initializes user data
	 * This should be called after successful authentication
	 */
	async sendConnectMessage() {
		if (this.app.loggedUser) {
			this.send({ type: "connect", userId: this.app.loggedUser.id, token: this.app.server.token } as ConnectMessage)
		}
	}

	async sendLogoutMessage() {
		this.send({ type: "logout" } as LogoutMessage)
	}

	sendGameInvite() {
		if (!this.app.loggedUser || this.app.game?.player2?.type !== "remote") return

		// TODO: send the game invite to the server
		this.send({
			type: "invite",
			userId: this.app.loggedUser.id,
			targetId: this.app.game.player2.user.id,
			options: this.app.game.options,
		})

		this.app.notifications.sentGameInviteNotification(this.app.game.player2.user.id)
	}

	acceptGameInvite() {
		if (!this.app.loggedUser) return
		this.send({
			type: "invite-response",
			response: "accept",
			userId: this.app.loggedUser!.id,
			targetId: (this.app.game!.player1! as RemotePlayer).user.id,
		})
	}

	declineGameInvite(senderId: number) {
		if (!this.app.loggedUser) return
		this.send({
			type: "invite-response",
			response: "decline",
			userId: this.app.loggedUser.id,
			targetId: senderId,
		} as InviteResponseMessage)
	}

	updateReadyState(state: boolean) {
		if (!this.app.loggedUser) return
		this.send({
			type: "ready",
			userId: this.app.loggedUser.id,
			state: state,
		} as ReadyMessage)
	}

	sendKeyEvent(key: string, pressed: boolean) {
		this.send({
			type: "key-event",
			key: key,
			pressed: pressed,
		} as KeyEventMessage)
	}

	cancelInvite() {
		if (this.app.game?.gameMode !== "remote") return
		this.send({
			type: "cancel-invite",
			targetId: (this.app.game.player2 as RemotePlayer).user.id,
		} as CancelInviteMessage)
	}

	cancelGame() {
		if (this.app.game?.gameMode !== "remote") return
		this.send({
			type: "cancel-game",
		} as CancelGameMessage)
	}

	/**
	 * Handles incoming WebSocket messages
	 * @param data - The received message data
	 */
	private handleReply(reply: WebSocketReply) {
		// console.log("WebSocket reply:", reply)
		switch (reply.type) {
			case "pong":
				// console.log("Websocket received pong")
				break
			case "connect":
			case "logout":
				this.handleUserStatusReply(reply)
				break
			case "chat":
				this.handleChatReply(reply)
				break
			case "invite":
				this.handleInviteReply(reply)
				break
			case "cancel-invite":
				this.handleCancelInviteReply(reply)
				break
			case "invite-response":
				this.handleInviteResponseReply(reply)
				break
			case "cancel-game":
				this.handleCancelGameReply(reply)
				break
			case "gameState":
				this.handleGameStateReply(reply)
				break
			default:
				console.warn("Unknown WebSocket message type:", reply.type)
		}
	}

	// ------------------- REPLY HANDLERS ------------------
	// ------------------- REPLY HANDLERS ------------------
	// ------------------- REPLY HANDLERS ------------------
	// ------------------- REPLY HANDLERS ------------------

	async handleUserStatusReply(reply: ConnectReply | LogoutReply) {
		// Determine the status based on the reply type
		const status = reply.type === "connect" ? "online" : "offline"

		// Ignore update for self
		if (reply.userId === this.app.loggedUser?.id) {
			return
		}

		// Update user status in the cache
		await this.app.cache.updateStatus(reply.userId, status)

		// Ignore visual updates for blocked users
		if (this.app.cache.isBlocked(reply.userId)) {
			return
		}

		// Update visual indicators of user status
		switchPlayerCardStatus(this.app, reply.userId, status)
		switchChatInput(reply.userId, status === "online")
		if (status === "online") {
			this.app.notifications.loginNotification(reply.userId)
		} else {
			this.app.notifications.logoutNotification(reply.userId)
		}
	}

	handleChatReply(reply: ChatReply) {
		// ignore messages from blocked users
		if (this.app.cache.isBlocked(reply.senderId)) {
			return
		}
		this.app.cache.addMessage(reply.senderId, reply)
	}

	handleInviteReply(reply: InviteReply) {
		if (this.app.cache.isBlocked(reply.senderId)) {
			return
		}
		this.app.notifications.gameInviteNotification(reply.senderId, reply.options)
	}

	handleCancelInviteReply(reply: CancelInviteReply) {
		if (this.app.cache.isBlocked(reply.senderId)) {
			return
		}

		this.app.notifications.gameInviteCancelledNotification(reply.senderId)
	}

	handleInviteResponseReply(reply: InviteResponseReply) {
		if (!this.app.game || this.app.cache.isBlocked(reply.senderId)) {
			return
		}

		if (reply.response === "accept") {
			this.app.game.player2Joined = true
			this.app.game.currentStep = "not-ready"
			this.app.notifications.gameInviteAcceptedNotification(reply.senderId)
		} else {
			this.app.game.player2 = undefined
			this.app.game.currentStep = "configuring"
			this.app.notifications.gameInviteDeclinedNotification(reply.senderId)
		}
		updateGameButtons(this.app.game)
		updateGamePlayers(this.app.game)
	}

	handleGameStateReply(reply: GameStateReply) {
		// console.log("Handling game state reply")
		if (!this.app.game) return
		const game = this.app.game
		if (!game) return
		if (game.player1?.type !== "remote" || game.player2?.type !== "remote") return
		if (reply.player1.id !== game.player1.user.id) return
		if (reply.player2.id !== game.player2.user.id) return

		const oldStep = game.currentStep

		// Store old ready states to detect changes
		const wasPlayer1Ready = game.player1Ready
		const wasPlayer2Ready = game.player2Ready

		game.currentStep = reply.currentStep
		game.player1Ready = reply.player1.ready
		game.player2Ready = reply.player2.ready

		// Log when a player becomes ready
		if (game.player1Ready && !wasPlayer1Ready) {
			this.app.notifications.playerReadyNotification(game.player1?.user.id)
		}
		if (game.player2Ready && !wasPlayer2Ready) {
			this.app.notifications.playerReadyNotification(game.player2?.user.id)
		}

		game.state.score1 = reply.player1.score
		game.state.score2 = reply.player2.score
		game.state.paddle1.x = reply.paddle1.x
		game.state.paddle1.y = reply.paddle1.y
		game.state.paddle2.x = reply.paddle2.x
		game.state.paddle2.y = reply.paddle2.y
		game.state.ball.x = reply.ball.x
		game.state.ball.y = reply.ball.y
		game.state.ball.dx = reply.ball.dx
		game.state.ball.dy = reply.ball.dy
		game.state.ball.speed = reply.ball.speed

		if (reply.winner) {
			game.winner = reply.winner === game.player1?.user.id ? game.player1 : game.player2
		}

		// Dont update if it's just a simple frame of the game.
		// This prevents the "give up" button from not having time to be pressed
		if (!(oldStep === "playing" && game.currentStep === "playing")) {
			updateGameButtons(game)
			updateGamePlayers(game)
		}
		// console.log("Game state updated")
	}

	handleCancelGameReply(reply: WebSocketReply) {
		if (!this.app.game) return
		if (this.app.game.player1?.type !== "remote" || this.app.game.player2?.type !== "remote") return

		// If we receive a cancel game message while not playing, there is no winner
		this.app.game.currentStep = "cancelled"
		this.app.game.player2Joined = false
		this.app.game.player2Ready = false
		updateGamePlayers(this.app.game)
		updateGameButtons(this.app.game)
	}
}
