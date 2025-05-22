import { FastifySchema } from "fastify"

/**
 * Schéma de validation pour la route de vérification de l'état du serveur
 */
export const healthCheckSchema: FastifySchema = {
	response: {
		200: {
			type: "object",
			properties: {
				status: { type: "string" },
				timestamp: { type: "string", format: "date-time" },
			},
		},
	},
}
