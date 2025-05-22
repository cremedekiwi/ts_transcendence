import { currentStepType, GameOptions } from "../Game/Game.js"

export type ConnectMessage = { type: "connect"; userId: number; token: string }
export type PingMessage = { type: "ping" }
export type LogoutMessage = { type: "logout" }
export type ChatMessage = { type: "chat"; targetId: number; message: string }
export type InviteMessage = {
	type: "invite"
	userId: number
	targetId: number
	options: GameOptions
}

export type InviteResponseMessage = {
	type: "invite-response"
	response: "accept" | "decline"
	userId: number
	targetId: number
}
export type ReadyMessage = { type: "ready"; userId: number; state: boolean }
export type CancelInviteMessage = { type: "cancel-invite"; targetId: number }
export type CancelGameMessage = { type: "cancel-game" }

export type GameInputMessage = {
	type: "gameinput"
	gameId: string
	inputType: "paddleMove" | "startGame" | "resetGame"
	paddlePosition?: number
	targetId: number
}

export type PongReply = { type: "pong"; loggedIn: boolean }
export type ConnectReply = { type: "connect"; userId: number }
export type LogoutReply = { type: "logout"; userId: number }
export type ChatReply = { type: "chat"; senderId: number; message: string }
export type ErrorReply = { type: "error"; message?: string }
export type SuccessReply = { type: "success" }
export type InviteReply = {
	type: "invite"
	senderId: number
	options: GameOptions
}
export type InviteResponseReply = {
	type: "invite-response"
	response: "accept" | "decline"
	senderId: number
}
export type ReadyReply = { type: "ready"; userId: number; state: boolean }
export type CancelInviteReply = { type: "cancel-invite"; senderId: number }
export type CancelGameReply = { type: "cancel-game" }

export type GameStateReply = {
	type: "gameState"
	currentStep: currentStepType
	player1: { id: number; ready: boolean; score: number }
	player2: { id: number; ready: boolean; score: number }
	paddle1: { x: number; y: number }
	paddle2: { x: number; y: number }
	ball: { x: number; y: number; dx: number; dy: number; speed: number }
	winner?: number
}

export type KeyEventMessage = {
	type: "key-event"
	key: string
	pressed: boolean
}

export type GameInputReply = {
	type: "gameinput"
	gameId: string
	senderId: number
	inputType: "paddleMove" | "startGame" | "resetGame"
	paddlePosition?: number
}

export type WebSocketMessage =
	| ConnectMessage
	| PingMessage
	| LogoutMessage
	| ChatMessage
	| InviteMessage
	| InviteResponseMessage
	| GameInputMessage
	| ReadyMessage
	| KeyEventMessage
	| CancelInviteMessage
	| CancelGameMessage

export type WebSocketReply =
	| PongReply
	| ConnectReply
	| LogoutReply
	| ChatReply
	| InviteReply
	| InviteResponseReply
	| ErrorReply
	| SuccessReply
	| GameInputReply
	| ReadyReply
	| GameStateReply
	| CancelInviteReply
	| CancelGameReply
