import db from "../../core/db.js"
import User from "../../core/types.js"
import { comparePassword, hashPassword } from "../../utils/password_hash.js"
import { sanitizeUsername } from "../../utils/sanitize.js" // You’ll create this file

/**
 * Inscrit un nouvel utilisateur
 * @param username Nom d'utilisateur
 * @param password Mot de passe
 */
export async function registerUser(username: string, password: string): Promise<number> {
	const cleanUsername = sanitizeUsername(username)

	const hashedPassword = await hashPassword(password)
	const stmt = db.prepare("INSERT INTO users (username, password, avatar) VALUES (?, ?, ?)")
	const result = stmt.run(cleanUsername, hashedPassword, "default.png")
	return result.lastInsertRowid
}

/**
 * Met à jour l'avatar d'un utilisateur
 */
export async function updateUserAvatar(userId: number, avatarFilename: string): Promise<void> {
	const stmt = db.prepare("UPDATE users SET avatar = ? WHERE id = ?")
	stmt.run(avatarFilename, userId)
}

/**
 * Valide les identifiants d'un utilisateur
 */
export async function validateUser(username: string, password: string): Promise<number | undefined> {
	const cleanUsername = sanitizeUsername(username)

	const user = db.prepare("SELECT * FROM users WHERE username = ?").get(cleanUsername) as User | undefined

	console.log("Login attempt for:", cleanUsername)
	console.log("User from DB:", user)

	if (!user || !(await comparePassword(password, user.password))) {
		console.log("Invalid credentials")
		return undefined
	}

	console.log("Login successful")
	return user.id
}

/**
 * Valide un mot de passe via l'ID de l'utilisateur
 */
export async function validateUserById(id: number, password: string): Promise<number | undefined> {
	const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined

	if (!user || !(await comparePassword(password, user.password))) {
		return undefined
	}

	return user.id
}

/**
 * Récupère un utilisateur via son ID
 */
export function getUserById(userId: number): User {
	return db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User
}

/**
 * Crée ou récupère un utilisateur Google
 */
export async function findOrCreateGoogleUser(googleId: string, email: string, name: string, picture?: string): Promise<number> {
	const existingUser = db.prepare("SELECT * FROM users WHERE google_id = ?").get(googleId) as User | undefined

	if (existingUser) {
		return existingUser.id
	}

	const username = sanitizeUsername(`${googleId}`)

	const stmt = db.prepare("INSERT INTO users (username, google_id) VALUES (?, ?)")
	const result = stmt.run(username, googleId)

	return result.lastInsertRowid
}
