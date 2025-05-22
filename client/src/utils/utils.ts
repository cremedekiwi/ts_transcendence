import Server from "../classes/Server.js"

export function getAvatarPath(avatar: string): string {
	if (avatar === "default.png") {
		return "/assets/images/avatars/default.png"
	} else {
		return `${Server.URL}/avatars/${avatar}`
	}
}

export function formatTime(seconds: number): string {
	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	const remainingSeconds = seconds % 60
	return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}
