// src/modules/users/users.routes.ts
import { FastifyInstance } from "fastify"
import * as GameController from "./game.controller.js"
import { acceptInviteSchema, createInviteSchema, declineInviteSchema, keyEventSchema, moveEventSchema, setReadySchema } from "./game.schemas.js"

/**
 * Enregistre les routes utilisateurs
 * @param fastify Instance Fastify
 */
export function registerGameRoutes(fastify: FastifyInstance): void {
	// All those routes use the userId of the request's session
	// Therefore the user needs to be authenticated first with /auth/login and have a valid token
	// If the opponent is using the client, he will get live updates through his websocket connection

	// Route to get the state of a game
	fastify.get("state", GameController.getState)
	// Route to create/join a game
	fastify.post("invite", { schema: createInviteSchema }, GameController.createInvite) // Route to create a game and invite a user
	fastify.get("invite", GameController.getInvites) // Route to get the invited game
	fastify.post("join", { schema: acceptInviteSchema }, GameController.acceptInvite) // Route to join a game
	fastify.post("decline", { schema: declineInviteSchema }, GameController.declineInvite) // Route to decline a game invite
	// Routes to set as ready or not ready
	fastify.post("/ready", { schema: setReadySchema }, GameController.setReady) // Route to set as ready or not ready
	// Route for keys input
	fastify.post("keyEvent", { schema: keyEventSchema }, GameController.keyEvent)
	// // Route for single movements
	fastify.post("moveEvent", { schema: moveEventSchema }, GameController.moveEvent)
}
