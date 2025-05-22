import Server from "./Server"

declare global {
	interface Window {
		google: {
			accounts: {
				id: {
					initialize: (config: GoogleSignInConfig) => void
					renderButton: (element: HTMLElement, options: GoogleButtonOptions) => void
					prompt: () => void
				}
			}
		}
		GOOGLE_CLIENT_ID: string
	}
}

interface GoogleSignInConfig {
	client_id: string
	callback: (response: GoogleCredentialResponse) => void
	auto_select?: boolean
	cancel_on_tap_outside?: boolean
}

interface GoogleButtonOptions {
	theme?: "outline" | "filled_blue" | "filled_black"
	size?: "large" | "medium" | "small"
	text?: "signin_with" | "signup_with" | "continue_with" | "signin"
	width?: number | string
	logo_alignment?: "left" | "center"
}

interface GoogleCredentialResponse {
	credential: string
	select_by?: string
	clientId?: string
}

export class GoogleButton {
	private static googleId = window.GOOGLE_CLIENT_ID
	private server: Server
	private buttonElement: HTMLElement

	constructor(server: Server, buttonElement: HTMLElement) {
		this.server = server
		this.buttonElement = buttonElement
		this.initialize()
	}

	/**
	 * Initializes the Google Sign-In button by loading the script and rendering the button.
	 */
	private async initialize(): Promise<void> {
		await this.loadGoogleSignInScript()
		this.renderButton()
	}

	/**
	 * Loads the Google Sign-In script if not already loaded.
	 */
	private async loadGoogleSignInScript(): Promise<void> {
		return new Promise((resolve) => {
			if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
				resolve()
				return
			}
			// console.log("google id :", GoogleButton.googleId)

			const script = document.createElement("script")
			script.src = "https://accounts.google.com/gsi/client"
			script.async = true
			script.defer = true
			script.onload = () => resolve()
			document.head.appendChild(script)
		})
	}

	/**
	 * Renders the Google Sign-In button on the provided element.
	 */
	private renderButton(): void {
		if (typeof window.google === "undefined") {
			console.error("Google Sign-In script not loaded")
			return
		}

		// Initialize Google Sign-In
		window.google.accounts.id.initialize({
			client_id: GoogleButton.googleId,
			callback: this.handleGoogleSignIn.bind(this),
			auto_select: false,
			cancel_on_tap_outside: true,
		})

		// Render the Google Sign-In button
		window.google.accounts.id.renderButton(this.buttonElement, {
			theme: "outline",
			size: "large",
			text: "signin_with",
			width: this.buttonElement.offsetWidth,
			logo_alignment: "center",
		})
	}

	/**
	 * Handles the Google Sign-In response.
	 * @param response - The Google credential response.
	 */
	private async handleGoogleSignIn(response: GoogleCredentialResponse): Promise<void> {
		try {
			const data = await this.server.sendServerRequest("/auth/google/token", "POST", { credential: response.credential })

			if (data.error) {
				throw data.error || "Authentication failed"
			}
			if (data.success && data.token) {
				this.server.token = data.token
				localStorage.setItem("jwt", this.server.token!)
				await this.server.startSession()
			}
		} catch (error: any) {
			console.error("Google authentication failed")
		}
	}
}
