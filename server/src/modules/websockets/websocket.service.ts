import { WebSocket } from "@fastify/websocket"
import { getUserById } from "../auth/auth.service.js"
import GameManager from "../Game/Game.Manager.js"
import { acceptInvite, cancelGame, cancelInvite, createInvite, declineInvite, setReady } from "../Game/game.service.js"
import { setStatus } from "../users/users.model.js"
import WebSocketManager from "./WebSocket.Manager.js"
import {
	CancelGameMessage,
	CancelInviteMessage,
	ChatMessage,
	ChatReply,
	ConnectMessage,
	ConnectReply,
	ErrorReply,
	GameInputMessage,
	GameInputReply,
	InviteMessage,
	InviteReply,
	InviteResponseMessage,
	InviteResponseReply,
	KeyEventMessage,
	PongReply,
	ReadyMessage,
} from "./websocket.types.js"

/**
 * @module WebSocketServiceFactory
 * @description Factory function generating websocket service bound to a socket instance.
 */
export default function makeWebSocketService(socket: WebSocket, verifyJwt: (token: string) => Promise<any>) {
	let userId: number | null = null

	return {
		async connectClient(message: ConnectMessage) {
			let reply: ConnectReply | ErrorReply = { type: "error" }

			if (!message.token) {
				reply.message = "token is missing"
				WebSocketManager.reply(socket, reply)
				return
			}
			let decoded: any
			try {
				decoded = await verifyJwt(message.token)
			} catch (err) {
				reply.message = "Invalid or expired token"
				WebSocketManager.reply(socket, reply)
				return
			}
			const tokenUserId = decoded.id || decoded.userId
			if (!tokenUserId) {
				reply.message = "Token does not contain user id"
				WebSocketManager.reply(socket, reply)
				return
			}

			if (!message.userId) {
				reply.message = "userId is missing"
			} else if (userId || WebSocketManager.isConnected(message.userId)) {
				reply.message = "Already connected somewhere else"
			} else if (!getUserById(message.userId)) {
				reply.message = "Unknown id"
			} else if (message.userId !== tokenUserId) {
				reply.message = "userId does not match token"
			} else {
				userId = message.userId
				WebSocketManager.addClient(message.userId, socket)
				reply = { type: "connect", userId: userId }
				setStatus(userId, "online")
			}

			if (reply.type == "error") WebSocketManager.reply(socket, reply)
			else WebSocketManager.broadcast(reply)
		},

		pingClient() {
			let reply: PongReply = { type: "pong", loggedIn: userId ? true : false }
			WebSocketManager.reply(socket, reply)
		},

		disconnectClient() {
			if (userId) {
				WebSocketManager.removeClient(userId)
				setStatus(userId, "offline")
				WebSocketManager.broadcast({ type: "logout", userId: userId })
				userId = null
			}
		},

		sendChat(message: ChatMessage) {
			let reply: ChatReply | ErrorReply = { type: "error" }

			if (!userId) {
				reply.message = "You are not connected"
			} else if (WebSocketManager.isConnected(message.targetId) == false) {
				reply.message = "Target is not connected"
			} else if (message.message == undefined) {
				reply.message = "Empty message"
			} else {
				reply = { type: "chat", senderId: userId, message: message.message }
			}

			if (reply.type == "error") {
				WebSocketManager.reply(socket, reply)
			} else {
				WebSocketManager.reply(socket, { type: "success" })
				WebSocketManager.sendTo(message.targetId, reply)
			}
		},
		handleInviteMessage(message: InviteMessage) {
			let reply: InviteReply | ErrorReply = { type: "error" }

			if (!userId) {
				reply.message = "You are not connected"
			} else if (WebSocketManager.isConnected(message.targetId) == false) {
				reply.message = "Target is not connected"
			} else {
				// Create invite reply for target user
				reply = {
					type: "invite",
					senderId: userId,
					options: message.options,
				}
			}

			if (reply.type == "error") {
				WebSocketManager.reply(socket, reply)
			} else {
				// Send success to sender
				WebSocketManager.reply(socket, { type: "success" })
				// Create the game invite
				// Notif is sent to the target user inside createInvite
				createInvite(userId!, message.targetId, message.options)
			}
		},
		handleCancelInviteMessage(message: CancelInviteMessage) {
			if (!userId) {
				WebSocketManager.reply(socket, { type: "error", message: "You are not connected" })
				return
			}
			const invite = cancelInvite(userId!, message.targetId)
			if (!invite) {
				WebSocketManager.reply(socket, { type: "error", message: "No invite found" })
				return
			}
			WebSocketManager.reply(socket, { type: "success" })
		},
		handleCancelGameMessage(message: CancelGameMessage) {
			if (!userId) {
				WebSocketManager.reply(socket, { type: "error", message: "You are not connected" })
				return
			}
			const game = cancelGame(userId!)
			if (!game) {
				WebSocketManager.reply(socket, { type: "error", message: "No game found" })
				return
			}
			WebSocketManager.reply(socket, { type: "success" })
		},
		handleInviteResponseMessage(message: InviteResponseMessage) {
			let reply: InviteResponseReply | ErrorReply = { type: "error" }

			if (!userId) {
				reply.message = "You are not connected"
			} else if (WebSocketManager.isConnected(message.userId) == false) {
				reply.message = "Sender is not connected"
			} else {
				// Create response reply with gameId
				reply = {
					type: "invite-response",
					senderId: userId,
					response: message.response,
				}
			}

			if (reply.type == "error") {
				WebSocketManager.reply(socket, reply)
			} else {
				// Send success to respondent
				WebSocketManager.reply(socket, { type: "success" })
				// Notif is sent to the host inside acceptInvite and declineInvite
				if (message.response == "accept") {
					acceptInvite(message.targetId, userId!)
				} else if (message.response == "decline") {
					declineInvite(message.targetId, userId!)
				}
				console.log("Invite response: ", message.response)
			}
		},
		handleReadyMessage(message: ReadyMessage) {
			if (!userId) {
				return
			}
			setReady(userId, message.state)
		},
		handleKeyEventMessage(message: KeyEventMessage) {
			if (!userId) {
				return
			}
			const game = GameManager.findGameByPlayerId(userId)
			if (game) {
				game.handleKeyEvent(userId, message.key, message.pressed)
			}
		},
		sendGameInput(message: GameInputMessage) {
			let reply: GameInputReply | ErrorReply = { type: "error" }

			if (!userId) {
				reply.message = "You are not connected"
			} else if (WebSocketManager.isConnected(message.targetId) == false) {
				reply.message = "Target is not connected"
			} else {
				// Create game input reply
				reply = {
					type: "gameinput",
					gameId: message.gameId,
					senderId: userId,
					inputType: message.inputType,
					paddlePosition: message.paddlePosition,
				}
			}

			if (reply.type == "error") {
				WebSocketManager.reply(socket, reply)
			} else {
				// Send success to sender
				WebSocketManager.reply(socket, { type: "success" })
				// Send game input to target
				WebSocketManager.sendTo(message.targetId, reply)
			}
		},
	}
}
