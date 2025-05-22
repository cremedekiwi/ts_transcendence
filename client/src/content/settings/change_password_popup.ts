import { App } from "../../classes/App.js"
import { baseButton, popupLink } from "../../components/buttons.js"
import { errorDiv, passwordInput } from "../../components/inputs.js"
import { t } from "../../translations/translations.js"
import { PASS_LEN, showError } from "../../utils/forms.js"

export function changePasswordPopup(app: App) {
	app.popup.open(changePasswordPopupHTML())
	changePasswordFormEvent(app)
}

function changePasswordPopupHTML(): string {
	return /* HTML */ `
		<section id="change-password" class="small-size container items-center justify-center gap-4">
			<form id="change-password-form" class="relative flex w-full flex-col gap-4 px-6">
				${errorDiv()}
				<h1 class="mt-2 text-center">${t("changePassword")}</h1>
				${passwordInput("old-password", t("oldPassword"))} ${passwordInput("new-password", t("newPassword"))}
				${passwordInput("confirm-password", t("confirm"))} ${baseButton(t("confirmOptions"), "type='submit'")}
			</form>
			${popupLink("settings", t("back"))}
		</section>
	`
}

function changePasswordFormEvent(app: App) {
	const form = document.getElementById("change-password-form") as HTMLFormElement
	form?.addEventListener("submit", async (event) => {
		event.preventDefault()
		const oldPasswordInput = document.querySelector("input[name='old-password']") as HTMLInputElement
		const newPasswordInput = document.querySelector("input[name='new-password']") as HTMLInputElement
		const confirmPasswordInput = document.querySelector("input[name='confirm-password']") as HTMLInputElement

		const oldPassword = oldPasswordInput.value.trim()
		const newPassword = newPasswordInput.value.trim()
		const confirmPassword = confirmPasswordInput.value.trim()

		try {
			if (!oldPassword || !newPassword || !confirmPassword) {
				throw t("allField")
			} else if (newPassword !== confirmPassword) {
				throw t("notSamePass")
			} else if (newPassword.length < PASS_LEN.min) {
				throw t("passMinimum")
			} else if (newPassword.length > PASS_LEN.max) {
				throw t("passMaximum")
			}

			const response = await app.server.updatePassword(oldPassword, newPassword)
			if (response.error) {
				throw response.error
			}

			app.popup.callHandler("settings")
		} catch (error: any) {
			showError(form, error)
		}
	})
}
