import { appendNewChatMessage } from "../content/chat.js"
import { Match } from "../types/match.js"
import { Chat, RelationshipType, User, UserData } from "../types/user.js"
import { ChatMessage, ChatReply } from "../types/websocket.js"
import { App } from "./App.js"

export default class Cache {
	public ready: boolean = false
	private users: Map<number, UserData> = new Map()
	private matches: Map<string, Match[]> = new Map()

	constructor(private app: App) {
		this.fetchAllUsers()
	}

	// ----------------- User data -----------------
	// ----------------- User data -----------------
	// ----------------- User data -----------------
	// ----------------- User data -----------------

	/**
	 * Retrieves a user from the cache.
	 * @param userId - The ID of the user.
	 * @returns The user data or undefined if not found.
	 */
	getUser(userId: number): UserData | null {
		return this.users.get(userId) || null
	}

	/**
	 * Retrieves user data for a specific username
	 * @param username - The username of the user to retrieve
	 * @returns The user data or null if not found
	 */
	getUserByUsername(username: string): UserData | null {
		return Array.from(this.users.values()).find((userData) => userData.user.username === username) || null
	}

	/**
	 * Retrieves all users from the cache.
	 * @returns An array of all user data.
	 */
	getAllUsers(): UserData[] {
		return Array.from(this.users.values())
	}

	getAllOtherUsers(): UserData[] {
		if (this.app.loggedUser) {
			return Array.from(this.users.values()).filter(
				(userData) => userData.user.id !== this.app.loggedUser!.id && userData.relationship !== "blocked",
			)
		} else {
			return this.getAllUsers()
		}
	}

	getAllFriends(): UserData[] {
		if (this.app.loggedUser) {
			return Array.from(this.users.values()).filter((userData) => userData.relationship === "friend")
		} else {
			return []
		}
	}

	getAllBlockedUsers(): UserData[] {
		if (this.app.loggedUser) {
			return Array.from(this.users.values()).filter((userData) => userData.relationship === "blocked")
		} else {
			return []
		}
	}

	getAllOtherOnlineUsers(): UserData[] {
		return Array.from(this.users.values()).filter((userData) => userData.user.status === "online" && userData.user.id !== this.app.loggedUser?.id)
	}

	clearUsers() {
		this.users.clear()
		this.ready = false
	}

	isBlocked = (userId: number): boolean => this.getUser(userId)?.relationship === "blocked"

	/**
	 * Retrieves initial user data from the server
	 * Populates the users map with data from the API
	 */
	async fetchAllUsers() {
		this.clearUsers()
		const res = await this.app.server.sendServerRequest("/users/list", "GET")
		if (res.error) return
		const users: UserData[] = res as UserData[]
		users.forEach((userData) => this.users.set(userData.user.id, userData))
		// console.log("Users fetched from server :", this.users)
		this.ready = true
	}

	async fetchUser(id: number) {
		const res = await this.app.server.sendServerRequest(`/users/list/${id}`, "GET")
		if (res.error) return
		const userData: UserData = res as UserData
		this.users.set(id, userData)
	}

	// ----------------- Update user data -----------------

	/**
	 * Updates a user's online status in the local cache
	 * @param id - The user ID to update
	 * @param status - The new status value
	 */
	async updateStatus(id: number, status: User["status"]) {
		const existing = this.users.get(id)
		// if client does not exist, we add it
		// useful on new registration
		if (!existing) {
			// console.log("Fetching new user of id ", id)
			await this.fetchUser(id)
			// console.log("New user : " , this.getUser(id))
		} else {
			// console.log("User ", id, " already exists")
			existing.user.status = status
		}
	}

	/**
	 * Updates the relationship status with a user
	 * @param id - The user ID to update relationship for
	 * @param relationship - The new relationship status
	 */
	updateRelationship(id: number, relationship: RelationshipType) {
		const existing = this.users.get(id)
		if (!existing) return

		existing.relationship = relationship
	}

	// ----------------- Chat data -----------------
	// ----------------- Chat data -----------------
	// ----------------- Chat data -----------------
	// ----------------- Chat data -----------------

	/**
	 * Adds a chat message to the conversation with a specific user
	 * Updates the UI to reflect the new message
	 * @param userId - The user ID of the conversation partner
	 * @param message - The message to add
	 */
	addMessage(userId: number, message: ChatMessage | ChatReply) {
		const userData = this.users.get(userId)
		if (!userData) {
			console.error(`User with ID ${userId} not found`)
			return
		}

		if (!userData.chats) {
			userData.chats = []
		}

		userData.chats.push(message)
		appendNewChatMessage(this.app, message)
	}

	getConversation(userId: number): Chat[] | null {
		const userData = this.users.get(userId)
		if (!userData) {
			console.error(`User with ID ${userId} not found`)
			return null
		}

		userData.unreadMessages = 0
		return userData.chats || null
	}

	// ----------------- Matches data -----------------
	// ----------------- Matches data -----------------
	// ----------------- Matches data -----------------
	// ----------------- Matches data -----------------

	/**
	 * Fetches matches for a specific user.
	 * If matches are already cached, returns them from the cache.
	 * Otherwise, fetches them from the server and stores them in the cache.
	 * @param username - The username of the user to fetch matches for.
	 * @returns An array of matches or null if an error occurs.
	 */
	async getMatchesByUsername(username: string): Promise<Match[]> {
		// Check if matches are already cached
		if (this.matches.has(username)) {
			// console.log(`Matches for ${username} retrieved from cache.`)
			return this.matches.get(username) as Match[]
		}

		// Fetch matches for the user
		const response = await this.app.server.sendServerRequest(`/matches/${username}`, "GET")
		if ("error" in response) {
			console.error("Error fetching matches:", response.error)
			return []
		}
		const matches = response as Match[]

		// Store the fetched matches in the cache
		this.matches.set(username, matches)

		return matches
	}

	// Clear matches for a specific user
	clearMatches(username: string) {
		this.matches.delete(username)
	}
}
