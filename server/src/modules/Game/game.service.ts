import { log } from "../../utils/logger.js"
import WebSocketManager from "../websockets/WebSocket.Manager.js"
import { CancelGameReply, CancelInviteReply, InviteReply, InviteResponseReply } from "../websockets/websocket.types.js"
import GameManager, { GameInvite } from "./Game.Manager.js"
import Game, { GameOptions } from "./Game.js"

export function createInvite(player1Id: number, player2Id: number, options: GameOptions) {
	const invite: GameInvite = {
		player1Id,
		player2Id,
		options,
	}
	GameManager.addInvite(invite)
	log("Game invite created:", invite)
	// Send invite to target
	WebSocketManager.sendTo(invite.player2Id, { type: "invite", senderId: player1Id, options } as InviteReply)
}

export function getInvites(playerId: number): GameInvite[] {
	const invites = GameManager.getInvitesForPlayer(playerId)
	log("Game invites for player", playerId, ":", invites)
	return invites
}

export function acceptInvite(hostId: number, player2Id: number): Game | null {
	const invite = GameManager.getSpecificInvite(hostId, player2Id)
	if (!invite) {
		log("Invite not found for player ", player2Id, " from host ", hostId)
		return null
	}
	// Check if the player is already in a game
	const existingGame = GameManager.findGameByPlayerId(player2Id)
	if (existingGame) {
		log("Player is already in a game:", existingGame)
		return existingGame
	}
	// Create a new game
	const game = new Game(invite.player1Id, invite.player2Id, invite.options)
	GameManager.addGame(game)
	log("Game created from invite:", invite)
	// Remove the invite
	GameManager.removeInvite(invite.player1Id, invite.player2Id)
	// Notify the host that the invite was accepted
	WebSocketManager.sendTo(invite.player1Id, { type: "invite-response", senderId: invite.player2Id, response: "accept" } as InviteResponseReply)
	return game
}

export function declineInvite(hostId: number, player2Id: number): GameInvite | null {
	const invite = GameManager.getSpecificInvite(hostId, player2Id)
	if (!invite) {
		log("Invite not found for player ", player2Id, " from host ", hostId)
		return null
	}
	GameManager.removeInvite(hostId, player2Id)
	// Notify the host that the invite was declined
	WebSocketManager.sendTo(invite.player1Id, { type: "invite-response", senderId: invite.player2Id, response: "decline" } as InviteResponseReply)
	log("Invite declined:", invite)
	return invite
}

export function cancelInvite(hostId: number, player2Id: number) {
	const invite = GameManager.getSpecificInvite(hostId, player2Id)
	if (!invite) {
		log("Invite not found for player ", player2Id, " from host ", hostId)
		return null
	}
	GameManager.removeInvite(hostId, player2Id)
	// Notify the target that the invite was canceled
	WebSocketManager.sendTo(invite.player2Id, { type: "cancel-invite", senderId: invite.player1Id } as CancelInviteReply)
	log("Invite canceled:", invite)
	return invite
}

export function cancelGame(playerId: number) {
	const game = GameManager.findGameByPlayerId(playerId)
	if (!game) {
		log("Game not found")
		return null
	}

	if (game.currentStep !== "playing") {
		// Simply remove the game if it hasn't started yet
		GameManager.removeGame(game)
	} else if (game.currentStep === "playing") {
		// If the game is in progress, set the other player as the winner and end the game
		game.winner = game.player1Id === playerId ? game.player2Id : game.player1Id
		game.state.done()
	}
	// Notify the other player that the game was canceled
	WebSocketManager.sendTo(playerId === game.player1Id ? game.player2Id : game.player1Id, { type: "cancel-game" } as CancelGameReply)
	log("Game canceled:", game)

	return game
}

export function setReady(playerId: number, ready: boolean): Game | null {
	const game = GameManager.findGameByPlayerId(playerId)
	if (!game) {
		log("Game not found")
		return null
	}

	// Set the ready state for the player
	if (game.player1Id === playerId) {
		game.player1Ready = ready
	} else if (game.player2Id === playerId) {
		game.player2Ready = ready
	} else {
		log("Player not found in game")
		return null
	}

	// Check if both players are ready
	game.updateCurrentStep()
	game.sendGameState()
	return game
}

// Mark a key as pressed or released for a player
export function addKeyEvent(playerId: number, key: string, pressed: boolean) {
	const game = GameManager.findGameByPlayerId(playerId)
	if (!game) {
		log("Game not found")
		return null
	}

	// Determine whether the user is player 1 or player 2
	const playerNumber: 1 | 2 = game.player1Id === playerId ? 1 : 2

	game.gameInputs.setPlayerKey(playerNumber, key, pressed)
	return game
}

export function movePaddle(playerId: number, direction: "up" | "down") {
	const game = GameManager.findGameByPlayerId(playerId)
	if (!game) {
		log("Game not found")
		return null
	}

	game.movePaddle(playerId, direction)
	return game
}
