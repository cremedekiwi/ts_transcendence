import { FastifySchema } from "fastify"

export const createInviteSchema: FastifySchema = {
	body: {
		type: "object",
		required: ["player1Id", "player2Id"],
		properties: {
			player1Id: { type: "number" },
			player2Id: { type: "number" },
			options: { type: "object", nullable: true }, // You can further specify options schema if needed
		},
	},
	response: {
		200: { type: "string" },
		400: { type: "object", properties: { error: { type: "string" } } },
	},
}

export const acceptInviteSchema: FastifySchema = {
	body: {
		type: "object",
		required: ["player1Id"],
		properties: {
			player1Id: { type: "number" },
		},
	},
	response: {
		200: { type: "object" },
		400: { type: "object", properties: { error: { type: "string" } } },
	},
}

export const declineInviteSchema: FastifySchema = {
	body: {
		type: "object",
		required: ["player1Id"],
		properties: {
			player1Id: { type: "number" },
		},
	},
	response: {
		200: { type: "object" },
		400: { type: "object", properties: { error: { type: "string" } } },
	},
}

export const setReadySchema: FastifySchema = {
	body: {
		type: "object",
		required: ["ready"],
		properties: {
			ready: { type: "boolean" },
		},
	},
	response: {
		200: { type: "object" },
		400: { type: "object", properties: { error: { type: "string" } } },
	},
}

export const keyEventSchema: FastifySchema = {
	body: {
		type: "object",
		required: ["key", "pressed"],
		properties: {
			key: { type: "string" },
			pressed: { type: "boolean" },
		},
	},
	response: {
		200: { type: "object" },
		400: { type: "object", properties: { error: { type: "string" } } },
	},
}

export const moveEventSchema: FastifySchema = {
	body: {
		type: "object",
		required: ["direction"],
		properties: {
			direction: { type: "string", enum: ["up", "down"] },
		},
	},
	response: {
		200: { type: "object" },
		400: { type: "object", properties: { error: { type: "string" } } },
	},
}
