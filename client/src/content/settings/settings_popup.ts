import { App } from "../../classes/App.js"
import { baseButton } from "../../components/buttons.js"
import { t } from "../../translations/translations.js"
import { getAvatarPath } from "../../utils/utils.js"

export function settingsPopup(app: App) {
	app.popup.open(settingsPopupHTML(app))
	// Logout button
	document.getElementById("logout-button")?.addEventListener("click", () => app.server.logoutRequest())
}

function settingsPopupHTML(app: App): string {
	const user = app.loggedUser
	if (!user) {
		return ""
	}

	const content = /* HTML */ `
		<section class="small-size container items-center justify-center gap-4">
			<div class="flex flex-col items-center">
				<img src="${getAvatarPath(user.avatar)}" alt="Avatar actuel" class="avatar h-24 w-24" />
				<h1 class="mt-2 text-2xl font-bold">${user.username}</h1>
			</div>
			<div class="flex w-full flex-col space-y-4 px-6">
				${baseButton(t("modifyName"), "data-popup='change-username'")} ${baseButton(t("modifyAvatar"), "data-popup='change-avatar'")}
				${baseButton(t("modifyPassword"), "data-popup='change-password'")} ${baseButton(t("confidentiality"), "data-popup='confidentiality'")}
				<div class="w-full text-center text-sm">
					<button id="logout-button" class="hover-effect text-center text-lg font-medium"> ${t("logout")} </a>
				</div>
			</div>
		</section>
	`

	return content
}
