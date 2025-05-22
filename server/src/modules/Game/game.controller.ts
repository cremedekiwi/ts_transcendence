import { FastifyReply, FastifyRequest } from "fastify"
import { sendError } from "../../utils/errorHandler.js"
import { defaultOptions } from "../../utils/game_utils.js"
import { GameOptions } from "./Game.js"
import GameManager from "./Game.Manager.js"
import * as GameService from "./game.service.js"

export interface GameInviteRequest {
	player1Id: number
	player2Id: number
	options?: GameOptions
}

export interface GameReadyRequest {
	ready: boolean
}

export interface KeyEventRequest {
	key: string
	pressed: boolean
}

export interface MoveEventRequest {
	direction: "up" | "down"
}

export function getState(request: FastifyRequest, reply: FastifyReply) {
	const playerId = request.session.userId
	const game = GameManager.findGameByPlayerId(playerId)

	if (!game) {
		return sendError(reply, 400, "No active game found")
	}
	return reply.status(200).send(game.getReply())
}

export function createInvite(request: FastifyRequest<{ Body: GameInviteRequest }>, reply: FastifyReply) {
	const { player1Id, player2Id } = request.body
	const options = request.body.options || defaultOptions

	GameService.createInvite(player1Id, player2Id, options)
	return reply.status(200).send("Game invite created")
}

export function getInvites(request: FastifyRequest, reply: FastifyReply) {
	const playerId = request.session.userId
	const invites = GameService.getInvites(playerId)
	return reply.status(200).send(invites)
}

export function acceptInvite(request: FastifyRequest<{ Body: { player1Id: number } }>, reply: FastifyReply) {
	const { player1Id: hostId } = request.body
	const player2Id = request.session.userId
	const game = GameService.acceptInvite(hostId, player2Id)
	if (!game) {
		return sendError(reply, 400, "Couldn't join the game, either no invite or already in a game")
	}
	return reply.status(200).send(game.getReply())
}

export function declineInvite(request: FastifyRequest<{ Body: { player1Id: number } }>, reply: FastifyReply) {
	const { player1Id: hostId } = request.body
	const player2Id = request.session.userId
	const invite = GameService.declineInvite(hostId, player2Id)
	if (!invite) {
		return sendError(reply, 400, "Couldn't decline the game invite")
	}
	return reply.status(200).send(invite)
}

export function setReady(request: FastifyRequest<{ Body: GameReadyRequest }>, reply: FastifyReply) {
	const { ready } = request.body
	const playerId = request.session.userId

	const game = GameService.setReady(playerId, ready)
	if (!game) {
		return sendError(reply, 400, "No active game found")
	}
	return reply.status(200).send(game.getReply())
}

export function keyEvent(request: FastifyRequest<{ Body: KeyEventRequest }>, reply: FastifyReply) {
	const { key, pressed } = request.body
	const playerId = request.session.userId

	const game = GameService.addKeyEvent(playerId, key, pressed)
	if (!game) {
		return sendError(reply, 400, "No active game found")
	}
	return reply.status(200).send(game.getReply())
}

export function moveEvent(request: FastifyRequest<{ Body: MoveEventRequest }>, reply: FastifyReply) {
	const { direction } = request.body
	const playerId = request.session.userId

	const game = GameService.movePaddle(playerId, direction)
	if (!game) {
		return sendError(reply, 400, "No active game found")
	}
	return reply.status(200).send(game.getReply())
}
