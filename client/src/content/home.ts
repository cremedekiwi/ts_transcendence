import { App } from "../classes/App.js"
import { baseButton } from "../components/buttons.js"
import { t } from "../translations/translations.js"

export function homeHTML(): string {
	const content = /* HTML */ `
		<section class="small-size container">
			<div class="mx-6 my-auto space-y-4 text-lg font-bold">
				<div id="logo-wrapper" class="mx-auto mb-6 w-1/2">
					<img id="logo" src="/assets/images/full_logo.png" />
				</div>
				${baseButton(t("online"), "data-link href='/players'")} ${baseButton(t("offline"), "data-link href='/pong'")}
				${baseButton(t("tournament"), "data-link href='/tournament'")}
			</div>
		</section>
	`
	return content
}

export function renderHome(app: App): void {
	app.changeContent(homeHTML())
	app.showBackground()
}
