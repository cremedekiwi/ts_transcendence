// src/modules/auth/auth.controller.ts
import { FastifyReply, FastifyRequest } from "fastify"
import { ErrorResponse, LoginRequest, MaResponse, RegisterRequest, SuccessResponse } from "../../core/types.js"
import { t } from "../../translations.js"
import { sendError } from "../../utils/errorHandler.js"
import { uploadAvatar } from "../../utils/upload.js"
import WebSocketManager from "../websockets/WebSocket.Manager.js"
import * as AuthService from "./auth.service.js"

/**
 * Contrôleur pour l'inscription d'un nouvel utilisateur
 */
export async function register(request: FastifyRequest<{ Body: RegisterRequest }>, reply: FastifyReply): Promise<SuccessResponse | ErrorResponse> {
	const { username, password, avatar } = request.body

	if (!username || !password) {
		return reply.status(400).send({ error: `${t("userAndPwdRequired")}` })
	}

	if (username.length < 3 || username.length > 30) {
		return reply.status(400).send({ error: t("nameMinimum") }) // ou maximum
	}
	if (password.length < 6 || password.length > 50) {
		return reply.status(400).send({ error: t("passMinimum") })
	}

	try {
		// Register the user first and get the user ID
		const userId = await AuthService.registerUser(username, password)

		// Process avatar if provided
		if (avatar && avatar.data) {
			try {
				await uploadAvatar(userId, avatar)
			} catch (error) {
				// Continue registration even if avatar upload fails
				console.error("Error saving avatar:", error)
			}
		}

		return reply.send({ success: true })
	} catch (err) {
		console.error("Registration error:", err)
		return reply.status(400).send({ error: err })
	}
}

/**
 * Contrôleur pour la connexion d'un utilisateur
 */
export async function login(request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply): Promise<SuccessResponse | ErrorResponse> {
	const { username, password } = request.body
	try {
		const userId = await AuthService.validateUser(username, password)
		if (!userId) {
			return reply.status(401).send({ error: `${t("idIncorrect")}` })
		}
		if (WebSocketManager.isConnected(userId)) {
			return sendError(reply, 402, `${t("connectSomewhereElse")}`)
		}

		request.session.userId = userId

		// Correct usage of fastify-jwt inside controller
		const token = request.server.jwt.sign({ id: userId })
		// console.log("sending token to client : ", token)
		return reply.send({ success: true, token })
	} catch (err) {
		console.error("Login error:", err)
		return reply.status(401).send({ error: `${t("idIncorrect")}` })
	}
}

/**
 * Contrôleur pour vérifier si l'utilisateur est connecté
 */
export async function getCurrentUser(request: FastifyRequest, reply: FastifyReply): Promise<MaResponse | ErrorResponse> {
	if (!request.session.userId) {
		return reply.status(401).send({ error: `${t("notConnected")}` })
	}

	const user = await AuthService.getUserById(request.session.userId)
	return reply.send({ loggedIn: true, user })
}

/**
 * Contrôleur pour la déconnexion d'un utilisateur
 */
export function logout(request: FastifyRequest, reply: FastifyReply): SuccessResponse {
	request.session.destroy()
	return reply.send({ success: true })
}
