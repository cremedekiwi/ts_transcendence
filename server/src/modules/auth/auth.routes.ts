import { FastifyInstance } from "fastify"
import * as AuthController from "./auth.controller.js"
import { googleTokenSchema, loginSchema, registerSchema } from "./auth.schemas.js"

export async function registerAuthRoutes(fastify: FastifyInstance) {
	// Existing routes
	fastify.post("/register", { schema: registerSchema }, AuthController.register)
	fastify.post("/login", { schema: loginSchema }, AuthController.login)
	fastify.get("/me", AuthController.getCurrentUser)
	fastify.post("/logout", AuthController.logout)

	// Import the Google auth controller
	const { googleSignIn } = await import("./google-auth.controller.js")

	// Google Sign-In route - just use '/google/token' since we already have 'auth/' prefix
	fastify.post("/google/token", { schema: googleTokenSchema }, googleSignIn)
}
