import { ChatMessage, ChatReply } from "./websocket.js"

export type User = {
	id: number
	username: string
	avatar: string
	password: string
	two_factor_secret?: string
	status: "online" | "playing" | "offline" | "hidden" | "deactivated" | "banned"
	created_at?: Date
}

/**
 * Type representing chat messages (both sent and received)
 */
export type Chat = ChatMessage | ChatReply

/**
 * Possible relationship states between users
 */
export type RelationshipType = "friend" | "blocked" | null

/**
 * Structure containing data about a user and their interactions
 */
export type UserData = {
	user: User
	chats: Array<Chat>
	unreadMessages?: number
	relationship: RelationshipType
}
