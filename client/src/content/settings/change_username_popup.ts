import { App } from "../../classes/App.js"
import { baseButton, popupLink } from "../../components/buttons.js"
import { errorDiv, textInput } from "../../components/inputs.js"
import { t } from "../../translations/translations.js"
import { hideError, showError, USER_LEN } from "../../utils/forms.js"

export function changeUsernamePopup(app: App) {
	app.popup.open(changeUsernamePopupHTML())
	changeUsernameFormEvent(app)
}

function changeUsernamePopupHTML(): string {
	return /* HTML */ `
		<section id="change-username" class="small-size container items-center justify-center gap-4">
			<form id="change-username-form" class="relative flex w-full flex-col gap-4 px-6">
				${errorDiv()}
				<h1 class="mt-2 text-center">${t("changeName")}</h1>
				${textInput("new-username", t("newName"))} ${baseButton(t("confirmOptions"), "type='submit'")}
			</form>
			${popupLink("settings", t("back"))}
		</section>
	`
}

function changeUsernameFormEvent(app: App) {
	const form = document.getElementById("change-username-form") as HTMLFormElement
	form?.addEventListener("submit", async (event) => {
		event.preventDefault()
		const usernameInput = document.querySelector("input[name='new-username']") as HTMLInputElement
		const newUsername = usernameInput.value.trim()

		hideError(form)
		try {
			if (!newUsername) {
				throw t("allField")
			} else if (newUsername.length < USER_LEN.min) {
				throw t("nameMinimum")
			} else if (newUsername.length > USER_LEN.max) {
				throw t("nameMaximum")
			}

			const response = await app.server.updateUsername(newUsername)
			if (response.error) {
				throw response.error
			}

			app.loggedUser!.username = newUsername
			app.navbar.updateNavbarLoggedState()
			app.popup.callHandler("settings")
		} catch (error: any) {
			showError(form, error)
		}
	})
}
