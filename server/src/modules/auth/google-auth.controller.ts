// src/modules/auth/google-auth.controller.ts
import { FastifyReply, FastifyRequest } from "fastify"
import { OAuth2Client } from "google-auth-library"
import { t } from "../../translations.js"
import { sendError } from "../../utils/errorHandler.js"
import WebSocketManager from "../websockets/WebSocket.Manager.js"
import { findOrCreateGoogleUser } from "./auth.service.js"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID

if (!GOOGLE_CLIENT_ID) {
	console.error("GOOGLE_CLIENT_ID is not set in environment variables")
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID)

interface GoogleTokenRequest {
	Body: {
		credential: string
	}
}

export async function googleSignIn(request: FastifyRequest<GoogleTokenRequest>, reply: FastifyReply) {
	try {
		const { credential } = request.body

		if (!credential) {
			return reply.status(400).send({ error: `${t("noCredential")}` })
		}

		const ticket = await client.verifyIdToken({
			idToken: credential,
			audience: GOOGLE_CLIENT_ID,
		})

		const payload = ticket.getPayload()

		if (!payload) {
			return reply.status(401).send({ error: `${t("invaliToken")}` })
		}

		const userId = await findOrCreateGoogleUser(payload.sub, payload.email!, payload.name!, payload.picture)

		if (WebSocketManager.isConnected(userId)) {
			return sendError(reply, 402, `${t("connectSomewhereElse")}`)
		}

		request.session.userId = userId
		await request.session.save()

		// Générer un token JWT comme dans la fonction login
		const token = request.server.jwt.sign({ id: userId })
		// console.log("token google jwt : ", token)
		// Retourner aussi le token JWT
		return reply.send({ success: true, token })
	} catch (error) {
		console.error("Google sign-in error:", error)
		return reply.status(401).send({ error: `${t("flag")}` })
	}
}
