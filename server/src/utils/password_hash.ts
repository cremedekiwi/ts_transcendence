// src/core/utils.ts
import bcrypt from "bcrypt"

/**
 * Hache un mot de passe avec bcrypt
 * @param password Mot de passe en clair
 * @returns Mot de passe haché
 */
export async function hashPassword(password: string): Promise<string> {
	return await bcrypt.hash(password, 10)
}

/**
 * Compare un mot de passe en clair avec un mot de passe haché
 * @param password Mot de passe en clair
 * @param hashedPassword Mot de passe haché
 * @returns true si les mots de passe correspondent, false sinon
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
	return await bcrypt.compare(password, hashedPassword)
}
