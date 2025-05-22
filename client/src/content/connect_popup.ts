import { App } from "../classes/App.js"
import { GoogleButton } from "../classes/GoogleButton.js"
import { baseButton } from "../components/buttons.js"
import { errorDiv, passwordInput, textInput } from "../components/inputs.js"
import { t } from "../translations/translations.js"
import { hideError, showError } from "../utils/forms.js"

export function connectPopupHTML(): string {
	const content = /* HTML */ `
		<section id="coonect-popup" class="small-size container">
			<div class="flex h-[57px] w-full text-xl font-bold">
				<button
					class="bg-violet hover:bg-berry flex w-1/2 cursor-pointer items-center justify-center rounded-tl-lg px-4 py-2"
					data-popup="register"
				>
					${t("register")}
				</button>
				<button class="bg-berry w-1/2 rounded-tr-lg px-4 py-2">${t("connect")}</button>
			</div>
			<form id="login-form" class="relative my-auto grid w-full space-y-2 px-12">
				${errorDiv()} ${textInput("username", t("username"), "required")} ${passwordInput("password", t("password"), "required")}
				<div class="!mt-2 flex w-full flex-col items-center justify-center gap-2">
					${baseButton(t("login"), "type='submit'")}
					<div class="my-2 flex w-full items-center gap-2">
						<div class="h-px flex-grow bg-gray-300"></div>
						<span class="text-sm text-gray-500">ou</span>
						<div class="h-px flex-grow bg-gray-300"></div>
					</div>
					<div id="google-signin-container" class="flex w-full items-center justify-center">
						<div id="google-signin-button" class="w-full"></div>
					</div>
				</div>
			</form>
		</section>
	`
	return content
}

function addFormEvent(app: App) {
	const loginForm = document.querySelector("form#login-form") as HTMLFormElement
	if (!loginForm) return

	loginForm.addEventListener("submit", async (event) => {
		event.preventDefault()

		const usernameInput = loginForm.querySelector("input[name='username']") as HTMLInputElement
		const passwordInput = loginForm.querySelector("input[name='password']") as HTMLInputElement

		if (!usernameInput || !passwordInput) return

		const username = usernameInput.value.trim()
		const password = passwordInput.value

		// Hide any previous error
		hideError(loginForm)

		if (!username || !password) {
			showError(loginForm, t("allField"))
			return
		}

		try {
			const response = await app.server.loginRequest(username, password)

			if (response.error) {
				throw response.error
			}
			// La redirection est gérée dans la fonction login
		} catch (error: any) {
			showError(loginForm, error)
			console.error(error)
		}
	})
}

export function connectPopup(app: App) {
	app.popup.open(connectPopupHTML())

	const googleButton = document.getElementById("google-signin-button") as HTMLElement
	if (googleButton) {
		new GoogleButton(app.server, googleButton)
	}
	addFormEvent(app)
}
