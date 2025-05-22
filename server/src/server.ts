// src/server.ts
import fastifyJwt from "@fastify/jwt"
import Fastify from "fastify"
import fs from "fs"
import { setupServer } from "./config/server.js"
import db from "./core/db.js"
import { seedDatabase } from "./core/seed.js"
import { cleanupBeforeExit } from "./utils/shutdown.js"

const JWT_SECRET = process.env.JWT_SECRET

const envToLogger = {
	development: {
		transport: {
			target: "pino-pretty",
			options: {
				translateTime: "SYS:HH:MM:ss",
				ignore: "pid,hostname,reqId,responseTime",
			},
		},
	},
	production: true,
	test: false,
}

// 🔹 Initialisation du serveur Fastify
const fastify = Fastify({
	logger: envToLogger.test,
	https: {
		key: fs.readFileSync("/etc/ssl/private/server.key"),
		cert: fs.readFileSync("/etc/ssl/certs/server.crt"),
	},
})

fastify.register(fastifyJwt, {
	secret: process.env.JWT_SECRET,
})

fastify.decorate("authenticate", async function (request, reply) {
	try {
		const decoded = await request.jwtVerify()
		request.user = decoded // ✅ manually assign the decoded token to request.user
		console.log("✅ JWT verified and assigned:", request.user)
	} catch (err) {
		console.log("❌ Authorization header:", request.headers.authorization)
		console.error("JWT error:", err)
		reply.status(401).send({ error: "server.ts : Unauthorized" })
	}
})

// 🔹 Configuration du serveur (cors, cookies, sessions) et enregistrement des routes
setupServer(fastify)
seedDatabase(db)

// 🔹 Lancement du serveur sur le port 8080
fastify.listen({ port: 8080, host: "0.0.0.0" }, (err, address) => {
	if (err) {
		console.error(err)
		process.exit(1)
	}
	// console.log(`🚀 Server running at ${address}`)
})

// Handle process signals for graceful shutdown
process.on("SIGINT", async () => {
	// console.log("Received SIGINT. Gracefully shutting down...")
	await cleanupBeforeExit()
	process.exit(0)
})

process.on("SIGTERM", async () => {
	// console.log("Received SIGTERM. Gracefully shutting down...")
	await cleanupBeforeExit()
	process.exit(0)
})

process.on("SIGUSR2", async () => {
	// console.log("Received SIGUSR2 (nodemon restart). Cleaning up...")
	await cleanupBeforeExit()
	process.exit(0)
})
