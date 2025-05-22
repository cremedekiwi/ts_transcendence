import { App } from "../classes/App.js"
import { GoogleButton } from "../classes/GoogleButton.js"
import { baseButton } from "../components/buttons.js"
import { errorDiv, passwordInput, textInput } from "../components/inputs.js"
import { t } from "../translations/translations.js"
import { hideError, PASS_LEN, showError, USER_LEN, validateAvatarInput } from "../utils/forms.js"

function registerPopupHTML(): string {
	const content = /* HTML */ `
		<section class="small-size container">
			<div class="flex h-[57px] w-full text-xl font-bold">
				<button class="bg-berry w-1/2 rounded-tl-lg px-4 py-2">${t("register")}</button>
				<button
					class="bg-violet hover:bg-berry flex w-1/2 cursor-pointer items-center justify-center rounded-tr-lg px-4 py-2"
					data-popup="connect"
				>
					${t("connect")}
				</button>
			</div>
			<form id="register-form" class="relative my-auto w-full space-y-2 px-12">
				${errorDiv()} ${textInput("username", t("username"))} ${passwordInput("password", t("password"))}
				${passwordInput("confirm-password", t("confirm"))}
				<div>
					<div class="flex w-full items-center">
						<span
							class="flex h-full w-1/2 flex-grow items-center truncate rounded-bl-lg rounded-tl-lg border-gray-300 bg-white px-4 py-1.5 text-gray-400"
							id="fileNameDisplay"
							>${t("avatar")}</span
						>
						<button
							type="button"
							class="bg-berry h-full w-1/2 rounded-br-lg rounded-tr-lg px-4 py-1.5 duration-300 hover:bg-opacity-80"
							onclick="document.getElementById('hiddenFile').click()"
						>
							${t("browse")}
						</button>
						<input
							type="file"
							id="hiddenFile"
							name="avatar"
							accept="image/*"
							class="hidden"
							onchange="document.getElementById('fileNameDisplay').textContent = this.files[0] ? this.files[0].name : 'Avatar'"
						/>
					</div>
				</div>
				<div class="!mt-2 flex w-full flex-col items-center justify-center gap-2">
					${baseButton(t("signin"), "type='submit'")}
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
	const registerForm = document.getElementById("register-form") as HTMLFormElement
	if (!registerForm) return

	registerForm.addEventListener("submit", async (event) => {
		event.preventDefault()

		const usernameInput = registerForm.querySelector("input[name='username']") as HTMLInputElement
		const passwordInput = registerForm.querySelector("input[name='password']") as HTMLInputElement
		const confirmPasswordInput = registerForm.querySelector("input[name='confirm-password']") as HTMLInputElement
		const avatarInput = registerForm.querySelector("input[name='avatar']") as HTMLInputElement

		if (!usernameInput || !passwordInput || !confirmPasswordInput) return

		const username = usernameInput.value.trim()
		const password = passwordInput.value
		const confirmPassword = confirmPasswordInput.value
		const avatarFile = avatarInput.files ? avatarInput.files[0] : null

		// Hide any previous error
		hideError(registerForm)

		const alphanumericRegex = /^[a-zA-Z0-9]+$/

		// Validation
		try {
			if (!username || !password || !confirmPassword) {
				throw t("allField")
			} else if (!alphanumericRegex.test(username)) {
				throw t("usernameAlphanumericOnly")
			} else if (username.length < USER_LEN.min) {
				throw t("nameMinimum")
			} else if (username.length > USER_LEN.max) {
				throw t("nameMaximum")
			} else if (password.length < PASS_LEN.min) {
				throw t("passMinimum")
			} else if (password.length > PASS_LEN.max) {
				throw t("passMaximum")
			} else if (password !== confirmPassword) {
				throw t("notSamePass")
			}
			validateAvatarInput(avatarFile)

			// Pass avatar file to register function
			const response = await app.server.registerRequest(username, password, avatarFile)

			if (response.error) {
				throw response.error
			}
			// La redirection est gérée dans la fonction register -> login
		} catch (error: any) {
			showError(registerForm, error)
		}
	})
}

export function registerPopup(app: App) {
	app.popup.open(registerPopupHTML())

	const googleButton = document.getElementById("google-signin-button") as HTMLElement
	if (googleButton) {
		new GoogleButton(app.server, googleButton)
	}

	addFormEvent(app)
}
