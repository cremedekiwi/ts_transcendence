import { setStatus } from "../modules/users/users.model.js"
import WebSocketManager from "../modules/websockets/WebSocket.Manager.js"

/**
 * Cleanup function to run before the server stops.
 */
export async function cleanupBeforeExit() {
	// console.log("Running cleanup tasks...")

	// Set all connected users to "offline"
	WebSocketManager.getAllConnectedClients().forEach((userId) => {
		setStatus(userId, "offline")
	})

	// console.log("Cleanup completed. Exiting...")
}
