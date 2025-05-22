// src/modules/users/users.routes.ts
import { FastifyInstance } from "fastify"
import * as UsersController from "./users.controller.js"
import { getAllUsersSchema, getUserSchema, updateUsernameSchema, updatePasswordSchema, updateAvatarSchema, modifyRelationshipSchema, unblockUserSchema, deleteUserSchema } from "./users.schemas.js"

/**
 * Enregistre les routes utilisateurs
 * @param fastify Instance Fastify
 */
export function registerUsersRoutes(fastify: FastifyInstance): void {
	fastify.get("all", { schema: getAllUsersSchema }, UsersController.getAllUsers)
	fastify.get("list", UsersController.getCustomUserList)
	fastify.get("list/:id", UsersController.getCustomUserData)
	fastify.get(":id", { schema: getUserSchema }, UsersController.getUserById)

	// Protected routes
	fastify.post("/update/relationship", { schema: modifyRelationshipSchema ,  preHandler: [fastify.authenticate] }, UsersController.modifyRelationship)
	fastify.post("/update/username",{ schema: updateUsernameSchema ,  preHandler: [fastify.authenticate] }, UsersController.updateUsername)
	fastify.post("/update/avatar",{ schema: updateAvatarSchema ,  preHandler: [fastify.authenticate] }, UsersController.updateAvatar)
	fastify.post("/update/password",{ schema: updatePasswordSchema,  preHandler: [fastify.authenticate] }, UsersController.updatePassword)
	fastify.delete("/unblock/:userId",{ schema: unblockUserSchema,  preHandler: [fastify.authenticate] }, UsersController.unblockUser)
	fastify.delete("/delete/:id",{ schema: deleteUserSchema ,  preHandler: [fastify.authenticate] }, UsersController.deleteUser)
}
