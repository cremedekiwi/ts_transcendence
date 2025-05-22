import { App } from "../classes/App.js"
import { t } from "../translations/translations.js"

function confidentialityHTML(): string {
	return /* HTML */ `
		<div class="flex h-full w-full flex-col items-center justify-start gap-12 px-10 py-6 text-lg font-bold">
			<h1 class="text-2xl">${t("confidentialityPolicy")}</h1>
			<p class="text-center text-base font-normal">${t("confidentialityIntro")}</p>
			<div class="w-full text-left text-base font-normal">
				<h2 class="text-xl font-bold">1. ${t("informationWeCollect")}</h2>
				<ul class="list-disc pl-6">
					<li>${t("usernameInfo")}</li>
					<li>${t("avatarInfo")}</li>
					<li>${t("googleIdInfo")}</li>
					<li>${t("gameStatsInfo")}</li>
					<li>${t("friendsBlockedInfo")}</li>
					<li>
						<strong>${t("localStorageData")}:</strong>
						<ul class="list-disc pl-6">
							<li>${t("jwtTokenInfo")}</li>
							<li>${t("languagePreferenceInfo")}</li>
							<li>${t("gameOptionsPreferenceInfo")}</li>
						</ul>
					</li>
				</ul>
				<h2 class="mt-4 text-xl font-bold">2. ${t("howWeUseData")}</h2>
				<ul class="list-disc pl-6">
					<li>${t("provideImproveServices")}</li>
					<li>${t("accountSecurity")}</li>
					<li>${t("personalizeExperience")}</li>
					<li>${t("manageRelationships")}</li>
				</ul>
				<h2 class="mt-4 text-xl font-bold">3. ${t("dataRetention")}</h2>
				<p>${t("dataRetentionInfo")}</p>
				<h2 class="mt-4 text-xl font-bold">4. ${t("yourRights")}</h2>
				<ul class="list-disc pl-6">
					<li>${t("viewDataInfo")}</li>
					<li>${t("updateDataInfo")}</li>
					<li>${t("deleteDataInfo")}</li>
				</ul>
				<h2 class="mt-4 text-xl font-bold">5. ${t("contactUs")}</h2>
				<p>${t("contactUsInfo")} <a href="mailto:support@transcendance.com" class="text-blue-500">support@transcendance.com</a>.</p>
			</div>
		</div>
	`
}

export function renderConfidentiality(app: App) {
	app.changeContent(confidentialityHTML())
	app.hideBackground()
}
