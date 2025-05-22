import db from "../../core/db.js"
import User from "../../core/types.js"
import { RelationshipType, UserWithRelationship } from "./users.schemas.js"

/**
 * Récupère tous les utilisateurs
 * @returns Liste des utilisateurs (sans les mots de passe)
 */
export function getAllUsers(): User[] {
	return db.prepare("SELECT id, username, avatar, status FROM users").all() as User[]
}

export function getAllUsersWithRelationships(loggedInUserId: number): UserWithRelationship[] {
	return db
		.prepare(
			`
		SELECT
			u.id, u.username, u.avatar, u.status,
			r.status AS relationship
		FROM users u
		LEFT JOIN user_relationships r
			ON u.id = r.related_user_id AND r.user_id = ?
	`,
		)
		.all(loggedInUserId) as UserWithRelationship[]
}

/**
 * Récupère un utilisateur par son ID
 * @param userId ID de l'utilisateur
 * @returns Informations de l'utilisateur ou undefined si non trouvé
 */
export function getUserById(userId: number): User | undefined {
	return db.prepare("SELECT id, username, avatar, status FROM users WHERE id = ?").get(userId) as User | undefined
}

// Checks if a username exists in the database
export function usernameExists(username: string): boolean {
	return db.prepare("SELECT COUNT(*) as count FROM users WHERE username = ?").get(username).count > 0
}

export function getUserByIdWithRelationships(loggedInUserId: number, targetId: number): UserWithRelationship {
	return db
		.prepare(
			`
		SELECT
			u.id, u.username, u.avatar, u.status,
			r.status AS relationship
		FROM users u
		LEFT JOIN user_relationships r
			ON u.id = r.related_user_id AND r.user_id = ?
		WHERE u.id = ? AND u.status != 'archived'
	`,
		)
		.get(loggedInUserId, targetId) as UserWithRelationship
}
/**
 * Récupère un utilisateur par son nom d'utilisateur
 * @param username Nom d'utilisateur
 * @returns Informations complètes de l'utilisateur ou undefined si non trouvé
 */
export function getUserByUsername(username: string): User | undefined {
	return db.prepare("SELECT * FROM users WHERE username = ?").get(username) as User | undefined
}

export function setStatus(id: number, status: string) {
	return db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, id)
}

/**
 * Modifies, adds, or deletes a relationship between two users.
 * @param userId The ID of the user modifying the relationship.
 * @param relatedUserId The ID of the user with whom the relationship is modified.
 * @param relationship The new status of the relationship ("friend", "blocked", or null to delete).
 */
export function modifyUserRelationship(userId: number, relatedUserId: number, relationship: RelationshipType) {
	if (relationship === null) {
		// Delete the relationship
		return db.prepare("DELETE FROM user_relationships WHERE user_id = ? AND related_user_id = ?").run(userId, relatedUserId)
	} else {
		// Add or update the relationship
		// First, check if the relationship already exists
		const existingRelationship = db
			.prepare("SELECT * FROM user_relationships WHERE user_id = ? AND related_user_id = ?")
			.get(userId, relatedUserId)

		if (existingRelationship) {
			// Update the relationship
			db.prepare("UPDATE user_relationships SET status = ? WHERE user_id = ? AND related_user_id = ?").run(relationship, userId, relatedUserId)
		} else {
			// Insert a new relationship
			db.prepare("INSERT INTO user_relationships (user_id, related_user_id, status) VALUES (?, ?, ?)").run(userId, relatedUserId, relationship)
		}
	}
}

/**
 * Update the user's username.
 */
export function updateUsername(userId: number, username: string): void {
	db.prepare("UPDATE users SET username = ? WHERE id = ?").run(username, userId)
}

/**
 * Update the user's avatar.
 */
export function updateAvatar(userId: number, avatar: string): void {
	db.prepare("UPDATE users SET avatar = ? WHERE id = ?").run(avatar, userId)
}

/**
 * Update the user's password.
 */
export function updatePassword(userId: number, hashedPassword: string): void {
	db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, userId)
}

export function deleteUser(userId: number): void {
	db.prepare("DELETE FROM users WHERE id = ?").run(userId)
}
