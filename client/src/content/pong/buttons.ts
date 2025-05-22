import Game, { currentStepType, gameMode as gameModeType } from "../../classes/Game/Game.js"
import { baseButton } from "../../components/buttons.js"
import { t } from "../../translations/translations.js"
import { renderTournament } from "../tournament/tournament.js"
import { updateGamePlayers } from "./players.js"

// Button definitions
const ButtonDefinitions: Record<string, (game: Game) => string> = {
	options: (game) => baseButton(t("options"), "data-popup='options'"),
	opponents: (game) => baseButton(t("opponents"), "data-popup='opponents'"),
	cancel: (game) => baseButton(t("cancel"), "data-action='cancel'"),
	validate: (game) => baseButton(t("validate"), `data-action='validate' ${game.player2 ? "enabled" : "disabled"}`),
	ready: (game) =>
		baseButton(
			(game.player2?.type === "remote" && game.player2.user.id === game.app.loggedUser?.id ? game.player2Ready : game.player1Ready)
				? t("notReady")
				: t("ready"),
			`data-action='ready'}`,
		),
	pause: (game) => baseButton(t("pause"), `data-action='pause'`),
	resume: (game) => baseButton(t("resume"), `data-action='resume'`),
	rematch: (game) => baseButton(t("rematch"), `data-action='rematch'`),
	giveup: (game) => baseButton(t("giveup"), `data-action='giveup'`),
	cancelTournament: (game) => baseButton(t("cancelTournament"), `data-action='cancelTournament'`),
	next: (game) => baseButton(t("next"), `data-action='next'`),
}

// Button mapping
const ButtonsMap: { gamemode: gameModeType; currentStep: currentStepType; buttons: string[] }[] = [
	{ gamemode: "local", currentStep: "configuring", buttons: ["options", "opponents", "validate"] },
	{ gamemode: "local", currentStep: "not-ready", buttons: ["options", "cancel", "ready"] },
	{ gamemode: "local", currentStep: "playing", buttons: ["options", "cancel", "pause"] },
	{ gamemode: "local", currentStep: "pause", buttons: ["options", "cancel", "resume"] },
	{ gamemode: "local", currentStep: "done", buttons: ["options", "rematch"] },
	{ gamemode: "remote", currentStep: "configuring", buttons: ["options", "opponents", "validate"] },
	{ gamemode: "remote", currentStep: "waiting-for-opponent", buttons: ["options", "cancel"] },
	{ gamemode: "remote", currentStep: "not-ready", buttons: ["options", "cancel", "ready"] },
	{ gamemode: "remote", currentStep: "playing", buttons: ["options", "giveup"] },
	{ gamemode: "remote", currentStep: "done", buttons: ["options", "rematch"] },
	{ gamemode: "remote", currentStep: "cancelled", buttons: ["options", "rematch"] },
	{ gamemode: "tournament", currentStep: "not-ready", buttons: ["cancelTournament", "ready"] },
	{ gamemode: "tournament", currentStep: "playing", buttons: ["cancelTournament", "pause"] },
	{ gamemode: "tournament", currentStep: "pause", buttons: ["cancelTournament", "resume"] },
	{ gamemode: "tournament", currentStep: "done", buttons: ["next"] },
]

export function updateGameButtons(game: Game) {
	const gameButtons = document.getElementById("gameButtons")
	if (!gameButtons) return

	// Find the button set for the current gamemode and step
	const mapping = ButtonsMap.find((mapping) => mapping.gamemode === game.gameMode && mapping.currentStep === game.currentStep)

	let leftButtons = "<div class='flex gap-2 whitespace-nowrap'>"
	let rightButtons = "<div class='flex gap-2 whitespace-nowrap'>"

	// console.log("Game buttons mapping:", mapping)

	mapping?.buttons.forEach((btn) => {
		if (btn === "options" || btn === "opponents") {
			leftButtons += ButtonDefinitions[btn](game)
		} else {
			rightButtons += ButtonDefinitions[btn](game)
		}
	})

	leftButtons += "</div>"
	rightButtons += "</div>"
	gameButtons.innerHTML = leftButtons + rightButtons
	initRightButtonEvent(game)
}

function initRightButtonEvent(game: Game) {
	const buttons = document.querySelectorAll("[data-action]")

	buttons.forEach((button) => {
		const action = button.getAttribute("data-action")
		button.addEventListener("click", () => {
			switch (action) {
				case "validate":
					if (game.player2?.type === "remote") {
						game.app.websocket.sendGameInvite()
					}
					game.updateCurrentStep()
					break
				case "ready":
					game.toggleReadyState()
					game.updateCurrentStep()
					break
				case "pause":
					game.currentStep = "pause"
					break
				case "resume":
					game.currentStep = "playing"
					break
				case "rematch":
					game.resetGame()
					break
				case "cancel":
				case "giveup":
					game.cancelGame()
					break
				case "cancelTournament":
					game.app.tournament = undefined
					renderTournament(game.app)
					break
				case "next":
					game.app.tournament!.currentGame = undefined
					renderTournament(game.app)
					break
			}
			updateGamePlayers(game)
			updateGameButtons(game)
		})
	})
}
