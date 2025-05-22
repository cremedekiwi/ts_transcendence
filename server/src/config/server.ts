// src/config/server.ts
import fastifyCookie from "@fastify/cookie"
import fastifyCors from "@fastify/cors"
import fastifySession from "@fastify/session"
import fastifyStatic from "@fastify/static"
import FastifyWebSocketPlugin from "@fastify/websocket"
import { randomBytes } from "crypto"
import { FastifyInstance, FastifyPluginOptions } from "fastify"
import path from "path"
import { registerAuthRoutes } from "../modules/auth/auth.routes.js"
import { registerCommonRoutes } from "../modules/common/common.routes.js"
import GameManager from "../modules/Game/Game.Manager.js"
import { registerGameRoutes } from "../modules/Game/game.routes.js"
import { registerMatchesRoutes } from "../modules/matches/matches.routes.js"
import { registerUsersRoutes } from "../modules/users/users.routes.js"
import handleConnection from "../modules/websockets/websocket.handler.js"

// Déclaration du module pour les sessions Fastify
declare module "fastify" {
	interface Session {
		userId?: number
	}
}

/**
 * Configure le serveur Fastify avec les plugins nécessaires
 * (CORS, cookies, sessions)
 */
export async function setupServer(fastify: FastifyInstance): Promise<void> {
	// 🔹 Configuration de CORS
	fastify.register(fastifyCors, {
		origin: true,
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"], // ✅ Allow incoming Auth header
		exposedHeaders: ["Authorization"], // ✅ Expose Auth header to browser if needed
	})

	// 🔹 Configuration des sessions et des cookies
	fastify.register(fastifyCookie)
	fastify.register(fastifySession, {
		secret: randomBytes(32).toString("hex"),
		cookie: {
			maxAge: 8 * 60 * 60 * 1000, // 8h to minutes to seconds to milliseconds
			secure: false, // Mettre `true` en production avec HTTPS
			httpOnly: true,
			sameSite: "lax", // Aide à permettre les requêtes cross-origin avec credentials
		},
		saveUninitialized: false,
	})

	fastify.register(FastifyWebSocketPlugin)

	// 🔹 Configuration des fichiers statiques
	fastify.register(fastifyStatic, {
		root: path.join(process.cwd(), "public", "avatars"),
		prefix: "/avatars/",
		decorateReply: false, // Important pour éviter les conflits avec le précédent
	})

	// 🔹 Enregistrement des routes
	fastify.register(registerRoutes)

	// Start the loop for game state updates
	GameManager.startGameLoop()
}

/**
 * Enregistre toutes les routes de l'application
 * @param fastify Instance Fastify
 */
function registerRoutes(fastify: FastifyInstance, options: FastifyPluginOptions): void {
	// Enregistrement des routes d'authentification
	fastify.register(registerAuthRoutes, { prefix: "auth/" })

	// Enregistrement des routes utilisateurs
	fastify.register(registerUsersRoutes, { prefix: "users/" })

	// Enregistrement des routes des matchs
	fastify.register(registerMatchesRoutes, { prefix: "matches/" })

	// Enregistrement des routes communes
	fastify.register(registerCommonRoutes)

	// Enregistrement des routes pour le jeu
	fastify.register(registerGameRoutes, { prefix: "game/" })

	// Websocket entrypoint
	fastify.get("/ws", { websocket: true }, handleConnection)
}
