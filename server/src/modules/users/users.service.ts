import { User } from "../../core/types.js"
import { t } from "../../translations.js"
import { hashPassword } from "../../utils/password_hash.js"
import { validateUserById } from "../auth/auth.service.js"
import * as UsersModel from "./users.model.js"
import { RelationshipType, UserWithRelationship } from "./users.schemas.js"

/**
 * Récupère tous les utilisateurs
 * @returns Liste des utilisateurs
 */
export function getAllUsers(): User[] {
	return UsersModel.getAllUsers()
}

/**
 * Récupère un utilisateur par son ID
 * @param userId ID de l'utilisateur
 * @returns Informations de l'utilisateur ou undefined si non trouvé
 */
export function getUserById(userId: number): User | undefined {
	return UsersModel.getUserById(userId)
}

/**
 * Vérifie si un utilisateur existe
 * @param username Nom d'utilisateur
 * @returns true si l'utilisateur existe, false sinon
 */
export function userExists(username: string): boolean {
	return UsersModel.getUserByUsername(username) !== undefined
}

export function getCustomUserList(loggedInUserId: any) {
	// Fetch users based on whether the user is logged in or not
	const users = loggedInUserId ? UsersModel.getAllUsersWithRelationships(loggedInUserId) : UsersModel.getAllUsers()

	// Transform to UserData[] format
	return users.map((user: User | UserWithRelationship) => {
		return {
			user: user as User,
			chats: [],
			relationship: "relationship" in user ? user.relationship || null : null,
		}
	})
}

export function getCustomUserData(loggedInUserId: number, targetId: number) {
	const user = UsersModel.getUserByIdWithRelationships(loggedInUserId, targetId)

	// Transform to UserData[] format
	return {
		user: user as User,
		chats: [],
		relationship: "relationship" in user ? user.relationship || null : null,
	}
}

export function modifyRelationship(userId: number, targetId: number, relationship: RelationshipType) {
	return UsersModel.modifyUserRelationship(userId, targetId, relationship)
}

/**
 * Update the user's username.
 */
export async function updateUsername(userId: number, username: string): Promise<void> {
	UsersModel.updateUsername(userId, username)
}

/**
 * Update the user's password.
 */
export async function updatePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
	const userId = await validateUserById(id, oldPassword)
	if (!userId) throw t("incorrect")

	const hashedPassword = await hashPassword(newPassword)
	UsersModel.updatePassword(userId, hashedPassword)
}

export async function deleteUser(id: number): Promise<void> {
	UsersModel.deleteUser(id)
}
