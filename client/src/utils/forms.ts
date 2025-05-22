import { t } from "../translations/translations.js"

export const USER_LEN = { min: 3, max: 20 }
export const PASS_LEN = { min: 6, max: 20 }

export function showError(form: HTMLFormElement, message: string) {
	const errorDiv = form.querySelector("[data-error]") as HTMLElement
	if (!errorDiv) {
		console.error("Error div not found")
		return
	}

	// console.log("Form element:", form)
	// console.log("Error message:", message)
	errorDiv.textContent = message
	errorDiv.classList.remove("hidden")
}

export function hideError(form: HTMLFormElement) {
	const errorDiv = form.querySelector("[data-error]") as HTMLElement
	if (!errorDiv) return

	errorDiv.classList.add("hidden")
	errorDiv.textContent = ""
}

export function validateAvatarInput(file: File | null): void {
	// Validate avatar file if one was selected
	if (file) {
		// Check file type
		const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
		if (validImageTypes.indexOf(file.type) === -1) {
			throw t("avatarError")
		}
		// Check file size (max 2MB)
		const maxSize = 2 * 1024 * 1024 // 2MB in bytes
		if (file.size > maxSize) {
			throw t("avatarTooBig")
		}
	}
}

// Helper function to convert a file to base64
export function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = () => {
			// The result includes the data URI prefix (e.g., "data:image/png;base64,")
			// which we need to remove to get just the base64 string
			const base64String = reader.result as string
			const base64Data = base64String.split(",")[1]

			resolve(base64Data)
		}
		reader.onerror = (error) => {
			console.error("Error reading file:", error)
			reject(error)
		}
	})
}
