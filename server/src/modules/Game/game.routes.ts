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
	fastify.get("state", { preHandler: [fastify.authenticate] }, GameController.getState)

	// Route to create/join a game
	fastify.post("invite", { schema: createInviteSchema, preHandler: [fastify.authenticate] }, GameController.createInvite)
	fastify.get("invite", { preHandler: [fastify.authenticate] }, GameController.getInvites)
	fastify.post("join", { schema: acceptInviteSchema, preHandler: [fastify.authenticate] }, GameController.acceptInvite)
	fastify.post("decline", { schema: declineInviteSchema, preHandler: [fastify.authenticate] }, GameController.declineInvite)

	// Routes to set as ready or not ready
	fastify.post("/ready", { schema: setReadySchema, preHandler: [fastify.authenticate] }, GameController.setReady)

	// Route for keys input
	fastify.post("keyEvent", { schema: keyEventSchema, preHandler: [fastify.authenticate] }, GameController.keyEvent)

	// Route for single movements
	fastify.post("moveEvent", { schema: moveEventSchema, preHandler: [fastify.authenticate] }, GameController.moveEvent)
}
