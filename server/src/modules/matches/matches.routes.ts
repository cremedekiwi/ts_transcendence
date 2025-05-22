import { FastifyInstance } from "fastify"
import { createMatchHandler, getAllMatchesHandler, getMatchesByUserHandler } from "./matches.controller.js"

const createMatchSchema = {
	body: {
		type: "object",
		required: ["player1", "player2", "winner", "score1", "score2", "duration"],
		properties: {
			player1: { type: "string" },
			player2: { type: "string" },
			winner: { type: "string" },
			score1: { type: "integer", minimum: 0 },
			score2: { type: "integer", minimum: 0 },
			duration: { type: "integer", minimum: 0 },
		},
	},
	response: {
		201: {
			type: "object",
			properties: {
				success: { type: "boolean" },
				message: { type: "string" },
			},
		},
	},
}

const getAllMatchesSchema = {
	response: {
		200: {
			type: "array",
			items: {
				type: "object",
				properties: {
					id: { type: "integer" },
					player1: { type: "string" },
					player2: { type: "string" },
					winner: { type: "string" },
					score1: { type: "integer" },
					score2: { type: "integer" },
					duration: { type: "integer" },
					created_at: { type: "string", format: "date-time" },
				},
			},
		},
	},
}

const getMatchesByUserSchema = {
	params: {
		type: "object",
		required: ["username"],
		properties: {
			username: { type: "string" },
		},
	},
	response: {
		200: {
			type: "array",
			items: {
				type: "object",
				properties: {
					id: { type: "integer" },
					player1: { type: "string" },
					player2: { type: "string" },
					winner: { type: "string" },
					score1: { type: "integer" },
					score2: { type: "integer" },
					duration: { type: "integer" },
					created_at: { type: "string", format: "date-time" },
				},
			},
		},
	},
}

export async function registerMatchesRoutes(fastify: FastifyInstance) {
	fastify.post("/create", { schema: createMatchSchema }, createMatchHandler) // Create a new match
	fastify.get("/all", { schema: getAllMatchesSchema }, getAllMatchesHandler) // Retrieve all matches
	fastify.get("/:username", { schema: getMatchesByUserSchema }, getMatchesByUserHandler) // Retrieve matches for a specific user
}
