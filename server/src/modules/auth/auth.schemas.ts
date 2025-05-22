import { FastifySchema } from "fastify"

/**
 * Schéma de validation pour la route d'inscription
 */
export const registerSchema: FastifySchema = {
	body: {
		type: "object",
		required: ["username", "password"],
		properties: {
			username: { type: "string", minLength: 3 },
			password: { type: "string", minLength: 6 },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				success: { type: "boolean" },
			},
		},
		400: {
			type: "object",
			properties: {
				error: { type: "string" },
			},
		},
	},
}

/**
 * Schéma de validation pour la route de connexion
 */
export const loginSchema: FastifySchema = {
	body: {
		type: "object",
		required: ["username", "password"],
		properties: {
			username: { type: "string" },
			password: { type: "string" },
		},
	},
	response: {
		200: {
			type: "object",
			required: ["success", "token"],
			properties: {
				success: { type: "boolean" },
				token: { type: "string" },
			},
		},
		401: {
			type: "object",
			properties: {
				error: { type: "string" },
			},
		},
	},
}

export const googleTokenSchema: FastifySchema = {
	body: {
		type: "object",
		required: ["credential"],
		properties: {
			credential: { type: "string" },
		},
	},
	response: {
		200: {
			type: "object",
			required: ["success", "token"],
			properties: {
				success: { type: "boolean" },
				token: { type: "string" },
			},
		},
		401: {
			type: "object",
			properties: {
				error: { type: "string" },
			},
		},
		402: {
			type: "object",
			properties: {
				error: { type: "string" },
			},
		},
	},
}
