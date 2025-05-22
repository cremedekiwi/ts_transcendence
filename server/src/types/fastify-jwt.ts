// src/types/fastify-jwt.ts
import "@fastify/jwt"

declare module "@fastify/jwt" {
	interface FastifyJWT {
		payload: { id: number } // type of JWT payload
		user: { id: number } // type after verification
	}
}
