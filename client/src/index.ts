import { App } from "./classes/App.js"
import Server from "./classes/Server.js"
import WebSocketClient from "./classes/WebSocketClient.js"

const HOST_MACHINE = "localhost"
// const HOST_MACHINE = "f2r4s9"

App.URL = "https://localhost:3000" // Set the URL for the app
Server.URL = `https://${HOST_MACHINE}:8080` // Set the URL for the server
WebSocketClient.URL = `wss://${HOST_MACHINE}:8080/ws` // Set the URL for the WebSocket client

const app = new App()

app.start()

const users = ["Nabil", "David", "Coco", "Kiwi"]

tryToLogin(0)

// Tries to log with every user until it finds one that works
async function tryToLogin(index: number) {
	if (index < users.length) {
		await app.server.loginRequest(users[index], "password")
	}
	if (app.isLoggedIn() === false) tryToLogin(index + 1)
}

export { app }
