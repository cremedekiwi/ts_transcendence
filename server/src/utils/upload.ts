import { promises as fsPromises } from "fs"
import path from "path"
import { updateUserAvatar } from "../modules/auth/auth.service.js"

export async function uploadAvatar(userId: number, avatar: { data: string; mimeType: string; filename: string }) {
	// Create avatars directory if it doesn't exist
	const avatarsDir = path.join(process.cwd(), "public", "avatars")
	await fsPromises.mkdir(avatarsDir, { recursive: true })

	// Decode base64 data
	const imageBuffer = Buffer.from(avatar.data, "base64")

	// Get file extension from MIME type
	const extension = avatar.mimeType.split("/")[1] || "png"
	const filename = `${userId}.${extension}`

	// Save the file
	const filePath = path.join(avatarsDir, filename)
	await fsPromises.writeFile(filePath, imageBuffer)

	// Verify the file exists after saving
	const fileStats = await fsPromises.stat(filePath)

	// Make sure the file has proper permissions
	await fsPromises.chmod(filePath, 0o666)

	// Update user's avatar in the database - just the filename
	await updateUserAvatar(userId, filename)
	return filename
}
