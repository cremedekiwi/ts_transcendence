import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Déterminer le répertoire actuel et le répertoire racine du projet
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "../..")

// Charger les variables d'environnement du fichier .env
dotenv.config({ path: path.resolve(rootDir, ".env") })

/**
 * Variables d'environnement de l'application
 */

// Google Auth
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
export const GOOGLE_CALLBACK_URI = process.env.GOOGLE_CALLBACK_URI
export const JWT_SECRET = process.env.JWT_SECRET
