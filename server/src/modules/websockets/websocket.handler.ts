import { WebSocket } from "@fastify/websocket"
import { FastifyRequest } from "fastify"
import { log } from "../../utils/logger.js"
import makeWebSocketService from "./websocket.service.js"
import { WebSocketMessage } from "./websocket.types.js"

/**
 * Main WebSocket connection handler.
 * @route GET /ws
 * @description Handles WebSocket events and messages.
 */
export default function handleConnection(socket: WebSocket, request: FastifyRequest) {
	const service = makeWebSocketService(socket, request.server.jwt.verify)

	// console.log("New websocket connection")

	socket.on("message", (data: any) => {
		try {
			const message = JSON.parse(data.toString()) as WebSocketMessage
			log(`Received: ${data.toString()}`)

			switch (message.type) {
				case "connect":
					service.connectClient(message)
					break

				case "ping":
					service.pingClient()
					break

				case "logout":
					service.disconnectClient()
					break

				case "chat":
					service.sendChat(message)
					break

				case "invite":
					service.handleInviteMessage(message)
					break

				case "cancel-invite":
					service.handleCancelInviteMessage(message)
					break

				case "cancel-game":
					service.handleCancelGameMessage(message)
					break

				case "invite-response":
					service.handleInviteResponseMessage(message)
					break

				case "ready":
					service.handleReadyMessage(message)
					break

				case "key-event":
					service.handleKeyEventMessage(message)
					break

				default:
					socket.send(JSON.stringify({ type: "error", message: "Unknown message type" }))
			}
		} catch {
			socket.send(JSON.stringify({ type: "error", message: "Invalid JSON" }))
		}
	})

	// logout client
	socket.on("close", () => {
		service.disconnectClient()
		// console.log("Websocket deconnected")
	})
}
