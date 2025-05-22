import { App } from "../../classes/App.js"
import { baseButton } from "../../components/buttons.js"
import { t } from "../../translations/translations.js"
import { DEFAULT_LOCAL_2, EASY_BOT, EXTREME_BOT, HARD_BOT, MEDIUM_BOT } from "../../types/player.js"
import { onlinePlayersPopup } from "../players.js"
import { updateGameButtons } from "./buttons.js"
import { updateGamePlayers } from "./players.js"

function opponentsPopupHTML(): string {
	const opponents = [
		{ label: t("localPlayer"), type: "local" },
		{ label: t("onlinePlayer"), type: "online" },
		{ label: t("bots"), type: "bots" },
	]

	return /*HTML*/ `
        <section class="container small-size-grow center gap-4 flex-col p-4">
            ${opponents.map((opponent) => baseButton(opponent.label, `data-opponent='${opponent.type}'`)).join("")}
        </section>
    `
}

function initOpponentsButtonEvents(app: App) {
	app.popup.root?.addEventListener("click", (event) => {
		const target = event.target as HTMLElement
		const opponentType = target.closest("[data-opponent]")?.getAttribute("data-opponent")

		if (!opponentType || !app.game) return

		switch (opponentType) {
			case "local":
				app.game.setPlayer(2, DEFAULT_LOCAL_2)
				app.popup.close()
				updateGamePlayers(app.game)
				updateGameButtons(app.game)
				break
			case "online":
				onlinePlayersPopup(app)
				break
			case "bots":
				botsPopup(app)
				break
		}
	})
}

export function opponentsPopup(app: App) {
	app.popup.open(opponentsPopupHTML())
	initOpponentsButtonEvents(app)
}

function botsPopup(app: App) {
	const bots = [
		{ label: t("easy"), type: "easy" },
		{ label: t("medium"), type: "medium" },
		{ label: t("hard"), type: "hard" },
		{ label: t("extreme"), type: "extreme" },
	]

	const html = /*HTML*/ `
		<section class="container small-size center gap-4 flex-col px-4">
			${bots.map((bot) => baseButton(bot.label, `data-bot='${bot.type}'`)).join("")}
		</section>
	`
	app.popup.open(html)
	app.popup.root?.addEventListener("click", (event) => {
		const target = event.target as HTMLElement
		const botType = target.closest("[data-bot]")?.getAttribute("data-bot")
		if (!botType || !app.game) return
		switch (botType) {
			case "easy":
				app.game.setPlayer(2, EASY_BOT)
				break
			case "medium":
				app.game.setPlayer(2, MEDIUM_BOT)
				break
			case "hard":
				app.game.setPlayer(2, HARD_BOT)
				break
			case "extreme":
				app.game.setPlayer(2, EXTREME_BOT)
				break
		}
		app.popup.close()
		updateGamePlayers(app.game!)
		updateGameButtons(app.game!)
	})
}
