import { App } from "../../classes/App.js"
import { baseButton, popupLink } from "../../components/buttons.js"
import { t } from "../../translations/translations.js"

export function confidentialityPopup(app: App) {
	app.popup.open(confidentialityPopupHTML())
}

function confidentialityPopupHTML(): string {
	return /* HTML */ `
		<section id="confidentiality" class="small-size container items-center justify-center gap-4 px-6">
			${baseButton(t("blockedUser"), "data-popup='blocked-users'")}
			${baseButton(t("confidentialityPolicy"), "data-link href='/confidentiality'")}
			${baseButton(t("deleteAccount"), "data-popup='delete-account'")} ${popupLink("settings", t("back"))}
		</section>
	`
}
