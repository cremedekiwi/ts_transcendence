import { FastifyReply } from "fastify"

/**
 * Sends a JSON error response with a given HTTP status code.
 * @param reply - Fastify reply object.
 * @param statusCode - HTTP error status code.
 * @param message - Error message to send.
 */
export function sendError(reply: FastifyReply, statusCode: number, message: string) {
	return reply.status(statusCode).send({ error: message, statusCode: statusCode })
}
