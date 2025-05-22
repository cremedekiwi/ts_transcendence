import { App } from "../../classes/App.js"
import { baseButton, popupLink } from "../../components/buttons.js"
import { errorDiv } from "../../components/inputs.js"
import { t } from "../../translations/translations.js"
import { showError } from "../../utils/forms.js"

export function deleteAccountPopup(app: App) {
	app.popup.open(deleteAccountPopupHTML())
	initDeleteFormEvents(app)
}

function deleteAccountPopupHTML(): string {
	return /* HTML */ `
		<section id="delete-account" class="small-size container items-center justify-center gap-4">
			<form id="delete-account-form" class="relative flex w-full flex-col gap-4 px-6">
				<p class="text-center">${t("deleteAccountConfirmation")}</p>
				${errorDiv()} ${baseButton(t("confirmOptions"), "type='submit'")}
			</form>
			${popupLink("confidentiality", t("back"))}
		</section>
	`
}

function initDeleteFormEvents(app: App) {
	const form = document.getElementById("delete-account-form") as HTMLFormElement
	form?.addEventListener("submit", async (event) => {
		event.preventDefault()
		const res = await app.server.sendServerRequest(`/users/delete/${app.loggedUser?.id}`, "DELETE")
		if (res.error) {
			showError(form, res.error)
			return
		}
		app.server.stopSession()
	})
}
