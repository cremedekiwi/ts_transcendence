import { App } from "../classes/App.js"
import { langButton } from "../components/buttons.js"
import { getLang, setLang } from "../translations/translations.js"

export function languagePopupHTML(): string {
	const currentLang = getLang()

	const allLanguages = [
		{ code: "fr", label: "Français" },
		{ code: "en", label: "English" },
		{ code: "ar", label: "عربي" },
		{ code: "ch", label: "中文" },
		{ code: "ta", label: "தமிழ்" },
	]

	const currentLanguage = allLanguages.find((lang) => lang.code === currentLang)
	const otherLanguages = allLanguages.filter((lang) => lang.code !== currentLang)

	const content = /* HTML */ `
		<section class="small-size-grow container">
			<div class="mx-6 space-y-4 my-6 text-lg font-bold">
				<!-- Current language first -->
				${currentLanguage ? langButton(currentLanguage.code, currentLanguage.label) : ""}

				<!-- Other languages below -->
				<div class="flex gap-4">
					${otherLanguages
						.slice(0, 2)
						.map((lang) => langButton(lang.code, lang.label))
						.join("")}
				</div>
				${otherLanguages.length > 2
					? `
				<div class="flex gap-4">
					${otherLanguages
						.slice(2, 4)
						.map((lang) => langButton(lang.code, lang.label))
						.join("")}
				</div>`
					: ""}
				${otherLanguages.length > 4
					? `
				<div class="flex gap-4">
					${otherLanguages
						.slice(4)
						.map((lang) => langButton(lang.code, lang.label))
						.join("")}
				</div>`
					: ""}
			</div>
		</section>
	`
	return content
}

function changeLanguage(app: App, key: string) {
	setLang(key)
	app.popup.close()
	app.navbar.updateNavbarLanguageFlag()
	app.router.renderCurrentPage()
}

function initChangeLanguageEvents(app: App) {
	const buttons = document.querySelectorAll("[data-lang]")
	buttons.forEach((button) => {
		button.addEventListener("click", () => {
			const key = button.getAttribute("data-lang")
			if (key) {
				changeLanguage(app, key)
			}
		})
	})
}
export function languagePopup(app: App) {
	app.popup.open(languagePopupHTML())
	initChangeLanguageEvents(app)
}
