import { connectPopup } from "../content/connect_popup.js"
import { RelationshipType, User } from "../types/user.js"
import { GameStateReply } from "../types/websocket.js"
import { fileToBase64 } from "../utils/forms.js"
import { App } from "./App.js"
import Game, { newGameFromStateReply } from "./Game/Game.js"

export default class Server {
	static URL: string
	isLoggedIn: boolean = false
	token: string | null = null

	constructor(private app: App) {
		// Restore token from localStorage if present
		this.token = localStorage.getItem("jwt")
		this.startSession()
	}

	public async sendServerRequest(endpoint: string, method: string, body?: any): Promise<any> {
		try {
			const headers: Record<string, string> = {}

			// Include JWT token if available
			if (this.token) {
				headers["Authorization"] = `Bearer ${this.token}`
			}
			const options: RequestInit = {
				method,
				credentials: "include",
				headers,
			}

			// Only set Content-Type and body if there is a body
			if (body) {
				headers["Content-Type"] = "application/json"
				options.body = JSON.stringify(body)
			}

			const res = await fetch(`${Server.URL}${endpoint}`, options)
			const data = await res.json()

			if (!res.ok) {
				throw new Error(data.error || "Une erreur est survenue lors de la requête.")
			}

			return data
		} catch (error) {
			console.error("Server request error:", error)
			return { error: error instanceof Error ? error.message : "Une erreur inconnue est survenue." }
		}
	}

	// ------------------ SESSION ------------------

	async loginRequest(username: string, password: string): Promise<any> {
		const data = await this.sendServerRequest("/auth/login", "POST", { username, password })

		if (data.success) {
			this.token = data.token
			if (this.token) localStorage.setItem("jwt", this.token)
			await this.startSession()
		}

		return data
	}

	async googleLoginRequest(credential: string): Promise<any> {
		const data = await this.sendServerRequest("/auth/google", "POST", {
			credential,
		})

		if (data.success && data.token) {
			this.token = data.token
			if (this.token) {
				localStorage.setItem("jwt", this.token)
			}

			await this.startSession()
		}

		return data
	}

	async logoutRequest(): Promise<any> {
		const data = await this.sendServerRequest("/auth/logout", "POST")

		if (data.success) {
			this.token = null
			localStorage.removeItem("jwt")
			await this.stopSession()
		}

		return data
	}

	async startSession(): Promise<void> {
		console.warn("Starting session")
		this.app.loggedUser = await this.getSessionUser()

		if (this.app.loggedUser) {
			await this.app.websocket.sendConnectMessage()
			this.isLoggedIn = true
			await this.app.cache.fetchAllUsers()
			// If a game is already in progress, fetch the game state
			await this.gameStateRequest()
			// Update the view
			this.app.navbar.updateNavbarLoggedState()
			this.app.router.renderCurrentPage()
		} else {
			this.isLoggedIn = false
		}
	}

	async stopSession(): Promise<void> {
		console.warn("Stopping session")
		if (!this.isLoggedIn) return

		await this.app.websocket.sendLogoutMessage()
		this.isLoggedIn = false
		this.app.loggedUser = undefined
		await this.app.cache.fetchAllUsers()
		// Reset the game
		this.app.game = undefined
		// Update the view
		this.app.navbar.updateNavbarLoggedState()
		this.app.router.renderCurrentPage()
		this.app.notifications.clearNotifications()
	}

	private async getSessionUser(): Promise<User | undefined> {
		const data = await this.sendServerRequest("/auth/me", "GET")
		return data.loggedIn ? data.user : undefined
	}

	// ------------------ AUTH ------------------

	async registerRequest(username: string, password: string, avatarFile?: File | null): Promise<any> {
		const requestBody: any = { username, password }

		if (avatarFile) {
			const base64Avatar = await fileToBase64(avatarFile)
			requestBody.avatar = {
				data: base64Avatar,
				mimeType: avatarFile.type,
				filename: avatarFile.name,
			}
		}

		const data = await this.sendServerRequest("/auth/register", "POST", requestBody)

		if (data.success) {
			return this.loginRequest(username, password)
		}

		return data
	}

	// ------------------ USER UPDATE ------------------

	async updateUsername(newUsername: string): Promise<any> {
		return this.sendServerRequest("/users/update/username", "POST", { username: newUsername })
	}

	async updateAvatar(avatarFile: File): Promise<any> {
		const base64Avatar = await fileToBase64(avatarFile)

		return this.sendServerRequest("/users/update/avatar", "POST", {
			avatar: {
				data: base64Avatar,
				mimeType: avatarFile.type,
				filename: avatarFile.name,
			},
		})
	}

	async updatePassword(oldPassword: string, newPassword: string): Promise<any> {
		return this.sendServerRequest("/users/update/password", "POST", {
			oldPassword,
			newPassword,
		})
	}

	// ------------------ RELATIONSHIPS ------------------

	async modifyRelationshipRequest(targetId: number, relationship: RelationshipType) {
		if (!this.isLoggedIn) {
			connectPopup(this.app)
			return
		}

		const data = await this.sendServerRequest("/users/update/relationship", "POST", {
			targetId,
			relationship,
		})

		if (data.success) {
			this.app.cache.updateRelationship(targetId, relationship)
			this.app.router.renderCurrentPage()
		}
	}

	async unblockUser(userId: number): Promise<any> {
		return this.sendServerRequest(`/users/unblock/${userId}`, "DELETE")
	}

	// ------------------ GAME STATE ------------------

	async gameStateRequest(): Promise<any> {
		if (!this.isLoggedIn) {
			return
		}

		const data = (await this.sendServerRequest("/game/state", "GET")) as GameStateReply

		if (data.type === "gameState") {
			this.app.game = newGameFromStateReply(this.app, data)
			this.app.websocket.handleGameStateReply(data)
		} else {
			this.app.game = new Game(this.app)
		}

		return data
	}
}
