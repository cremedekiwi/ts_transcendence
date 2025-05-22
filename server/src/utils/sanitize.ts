// Strips tags and trims the string. You can extend this later.
const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/

export function sanitizeUsername(input: string): string {
	const trimmed = input
		.trim()
		.replace(/<[^>]*>?/gm, "")
		.replace(/[\n\r\t]/g, "")
	if (trimmed.length < 3 || trimmed.length > 30) throw new Error("Invalid username length")
	if (!ALPHANUMERIC_REGEX.test(trimmed)) throw new Error("Username must be alphanumeric only")
	return trimmed
}
