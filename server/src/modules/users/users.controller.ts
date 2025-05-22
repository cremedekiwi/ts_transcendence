// src/modules/users/users.controller.ts
import { FastifyReply, FastifyRequest } from "fastify"
import { t } from "../../translations.js"
import "../../types/fastify-jwt.js"
import { sendError } from "../../utils/errorHandler.js"
import { sanitizeUsername } from "../../utils/sanitize.js"
import { uploadAvatar } from "../../utils/upload.js"
import { RelationshipType } from "./users.schemas.js"
import * as UsersService from "./users.service.js"

/**
 * Retrieve all users.
 */
export async function getAllUsers(_: FastifyRequest, reply: FastifyReply) {
	try {
		const users = UsersService.getAllUsers()
		return reply.status(200).send(users)
	} catch (error) {
		console.error("Error retrieving users:", error)
		return reply.status(500).send({ error: `${t("userFetchError")}` })
	}
}

/**
 * Retrieve a user by ID.
 */
export async function getUserById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
	const userId = parseInt(request.params.id)

	try {
		const user = UsersService.getUserById(userId)
		if (!user) {
			return reply.status(404).send({ error: `${t("userNotFound")}` })
		}
		return reply.status(200).send(user)
	} catch (error) {
		console.error("Error retrieving user by ID:", error)
		return reply.status(500).send({ error: `${t("userFetchError")}` })
	}
}

/**
 * Retrieve all users and their relationship with the session user.
 */
export async function getCustomUserList(request: FastifyRequest, reply: FastifyReply) {
	const loggedInUserId = request.session?.userId

	try {
		const users = UsersService.getCustomUserList(loggedInUserId)
		return reply.status(200).send(users)
	} catch (error) {
		console.error("Error retrieving custom user list:", error)
		return reply.status(500).send({ error: `${t("userFetchError")}` })
	}
}

/**
 * Retrieve a user and its relationship with the session user.
 */
export async function getCustomUserData(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
	const loggedInUserId = request.session?.userId
	if (!loggedInUserId) {
		return sendError(reply, 400, "Not logged in")
	}
	const targetId = request.params.id
	if (!targetId) {
		return sendError(reply, 400, "No target id")
	}

	try {
		const user = UsersService.getCustomUserData(loggedInUserId, targetId)
		return reply.status(200).send(user)
	} catch (error) {
		console.error("Error retrieving custom user:", error)
		return reply.status(500).send({ error: `${t("userFetchError")}` })
	}
}

/**
 * Modify a relationship between the logged-in user and another user.
 */
export async function modifyRelationship(
	request: FastifyRequest<{
		Body: { targetId: number; relationship: RelationshipType }
	}>,
	reply: FastifyReply,
) {
	const loggedInUserId = request.session?.userId
	const { targetId, relationship } = request.body

	if (!loggedInUserId) {
		return sendError(reply, 401, `${t("notLoggedIn")}`)
	}

	try {
		await UsersService.modifyRelationship(loggedInUserId, targetId, relationship)
		return reply.status(200).send({ success: true })
	} catch (error) {
		console.error("Error modifying relationship:", error)
		return sendError(reply, 400, error as string)
	}
}

/**
 * Update the user's username.
 */
export async function updateUsername(request: FastifyRequest, reply: FastifyReply) {
	const { username } = request.body
	const userId = request.user?.id
	console.log("request user = ", request.user)

	if (!userId) return reply.status(401).send({ error: "users.controllers : Unauthorized" })

	const sanitizedUsername = sanitizeUsername(username)
	if (sanitizedUsername.length === 0) {
		return reply.status(400).send({ error: "Username cannot be empty after sanitization." })
	}

	try {
		await UsersService.updateUsername(userId, sanitizedUsername)
		return reply.send({ success: true })
	} catch (err) {
		console.error(err)
		return reply.status(500).send({ error: "Update failed" })
	}
}

/**
 * Update the user's avatar.
 */
export async function updateAvatar(
	request: FastifyRequest<{
		Body: {
			avatar: {
				data: string
				mimeType: string
				filename: string
			}
		}
	}>,
	reply: FastifyReply,
) {
	const loggedInUserId = request.session?.userId
	const { avatar } = request.body

	if (!loggedInUserId) {
		return sendError(reply, 401, `${t("notLoggedIn")}`)
	}

	try {
		const filename = await uploadAvatar(loggedInUserId, avatar)
		return reply.status(200).send({ success: true, filename })
	} catch (error) {
		console.error("Error updating avatar:", error)
		return sendError(reply, 500, `${t("avatarUpdateError")}`)
	}
}

/**
 * Update the user's password.
 */
export async function updatePassword(
	request: FastifyRequest<{
		Body: { oldPassword: string; newPassword: string }
	}>,
	reply: FastifyReply,
) {
	const loggedInUserId = request.session?.userId
	const { oldPassword, newPassword } = request.body

	if (!loggedInUserId) {
		return sendError(reply, 401, `${t("notLoggedIn")}`)
	}

	if (!oldPassword || !newPassword) {
		return sendError(reply, 400, `${t("missingPwd")}`)
	}

	try {
		await UsersService.updatePassword(loggedInUserId, oldPassword, newPassword)
		return reply.status(200).send({ success: true })
	} catch (error) {
		console.error("Error updating password:", error)
		return sendError(reply, 400, error as string)
	}
}

/**
 * Unblock a user (not implemented yet).
 */
export async function unblockUser(_: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
	return reply.status(501).send({ error: `${t("notImplemented")}` })
}

export async function deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
	const loggedInUserId = request.session?.userId
	const userId = parseInt(request.params.id)

	if (!loggedInUserId) {
		return sendError(reply, 401, `${t("notLoggedIn")}`)
	}

	if (loggedInUserId !== userId) {
		return sendError(reply, 403, `${t("notAuthorized")}`)
	}

	try {
		// console.log("Deleting user with ID:", userId)
		await UsersService.deleteUser(userId)
		// console.log("User deleted successfully")
		return reply.status(200).send({ success: true })
	} catch (error) {
		console.error("Error deleting user:", error)
		return sendError(reply, 500, `${t("userDeleteError")}`)
	}
}
