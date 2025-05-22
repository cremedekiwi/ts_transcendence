import { App } from "../../classes/App.js"
import { initPlayerButtonEvents } from "../../components/player_card.js"
import { playersTabContentHTML } from "../players.js"

export function blockedUsersPopup(app: App) {
	app.popup.open(blockedUsersPopupHTML(app))
	initPlayerButtonEvents(app)
}

function blockedUsersPopupHTML(app: App): string {
	return /* HTML */ ` <section class="small-size no-scrollbar container overflow-y-scroll">${playersTabContentHTML(app, "blocked")}</section> `
}
