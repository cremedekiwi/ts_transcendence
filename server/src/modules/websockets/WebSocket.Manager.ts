import { WebSocket } from "@fastify/websocket"
import { log } from "../../utils/logger.js"
import { WebSocketReply } from "./websocket.types.js"

/**
 * @module WebSocketManager
 * @description Manages connected WebSocket clients.
 */
class WebSocketManager {
	private clients: Map<number, WebSocket> = new Map()

	/**
	 * Adds a client to the manager.
	 * @param id - Unique user id.
	 * @param socket - WebSocket connection.
	 */
	addClient(id: number, socket: WebSocket) {
		this.clients.set(id, socket)
		log(`Client connected: ${id}`)
	}

	/**
	 * Removes a client from the manager.
	 * @param id - Unique user id.
	 */
	removeClient(id: number) {
		this.clients.delete(id)
		log(`Client disconnected: ${id}`)
	}

	/**
	 * Sends a message to a specific client.
	 * @param id - Target client id.
	 * @param message - Message to send.
	 */
	sendTo(id: number, reply: WebSocketReply) {
		const client = this.clients.get(id)
		if (!client) return
		client.send(JSON.stringify(reply))
		log(`Sent to ${id}: ${JSON.stringify(reply)}`)
	}

	reply(socket: WebSocket, reply: WebSocketReply) {
		socket.send(JSON.stringify(reply))
		log(`Sent: ${JSON.stringify(reply)}`)
	}

	getAllConnectedClients(): number[] {
		return Array.from(this.clients.keys())
	}

	isConnected(id: number) {
		return this.clients.has(id)
	}

	/**
	 * Broadcasts a message to all connected clients.
	 * @param message - Message to broadcast.
	 */
	broadcast(reply: WebSocketReply) {
		this.clients.forEach((client) => this.reply(client, reply))
	}
}

export default new WebSocketManager()
