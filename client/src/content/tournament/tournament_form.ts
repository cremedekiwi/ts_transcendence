import { App } from "../../classes/App.js"
import { Tournament, TournamentPlayer } from "../../classes/Tournament.js"
import { baseButton } from "../../components/buttons.js"
import { errorDiv, textInput } from "../../components/inputs.js"
import { t } from "../../translations/translations.js"
import { USER_LEN, showError } from "../../utils/forms.js"

function tournamentFormHTML(): string {
	const botOptions = [
		{ label: t("player"), value: "" },
		{ label: t("easyBot"), value: "easy" },
		{ label: t("mediumBot"), value: "medium" },
		{ label: t("hardBot"), value: "hard" },
		{ label: t("extremeBot"), value: "extreme" },
	]
	function playerBotRow(id: number, defaultName: string = "") {
		return /* HTML */ `
			<div class="mb-2 flex items-center gap-3">
				<div class="relative w-1/2">
					<select
						name="type${id}"
						class="player-type-select border-violet/50 hover:border-violet focus:ring-berry text-eerie h-[42px] w-full rounded-lg border-2 bg-white/95 px-4 py-2 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2"
					>
						${botOptions.map((bot) => `<option class="text-eerie py-1" value="${bot.value}">${bot.label}</option>`).join("")}
					</select>
				</div>
				<div class="w-1/2">${textInput(`player${id}`, t(`player${id}`), `required value='${defaultName}' maxlength='${USER_LEN.max}'`)}</div>
			</div>
		`
	}
	return /* HTML */ `
		<section id="tournament" class="small-size container px-4">
			<div class="flex h-full items-center justify-center text-sm">
				<form id="tournament-form" class="flex flex-col gap-2">
					${errorDiv()} ${playerBotRow(1, "")} ${playerBotRow(2, "")} ${playerBotRow(3, "")} ${playerBotRow(4, "")}
					<div class="flex gap-2">
						${baseButton(t("options"), "type='button' data-popup='options'")} ${baseButton(t("create"), "type='submit'")}
					</div>
				</form>
			</div>
		</section>
	`
}

function validatePlayers(players: TournamentPlayer[]): string | null {
	const names: string[] = players.map((player) => player.name)
	// Check if all fields are filled
	if (names.some((name) => !name.trim())) {
		return t("allField")
	}

	// Check if any name exceeds the maximum length
	if (names.some((name) => name.length > USER_LEN.max)) {
		return t("nameMaximum")
	}

	// Check for duplicate names only among human players
	const humanPlayers = players.filter((player) => player.type === "local")
	const humanPlayerNames = humanPlayers.map((player) => player.name)
	const uniqueHumanPlayerNames = new Set(humanPlayerNames)

	if (uniqueHumanPlayerNames.size !== humanPlayerNames.length) {
		return t("nameTaken")
	}

	return null
}

function initTournament(app: App) {
	const form = document.getElementById("tournament-form") as HTMLFormElement
	if (!form) {
		console.error("Tournament form not found")
		return
	}

	// Use querySelectorAll to update the input value on every select change
	const typeSelects = form.querySelectorAll("select[name^='type']") as NodeListOf<HTMLSelectElement>
	typeSelects.forEach((typeSel) => {
		const idx = typeSel.name.replace("type", "")
		const nameInput = form.querySelector(`[name='player${idx}']`) as HTMLInputElement
		typeSel.addEventListener("change", () => {
			const botLabel = typeSel.options[typeSel.selectedIndex].text
			if (typeSel.value !== "") {
				nameInput.value = botLabel
			} else {
				nameInput.value = ""
			}
		})
	}) //Pour eviter de changer le nom a chaque fois

	form.addEventListener("submit", (e) => {
		e.preventDefault()
		const players: TournamentPlayer[] = Array.from(typeSelects).map((typeSel) => {
			const idx = typeSel.name.replace("type", "")
			const type = typeSel.value
			const name = (form.querySelector(`[name='player${idx}']`) as HTMLInputElement).value
			if (type === "easy" || type === "medium" || type === "hard" || type === "extreme") {
				return { type: "bot", difficulty: type, name }
			} else {
				return { type: "local", name }
			}
		})
		const error = validatePlayers(players)
		if (error) {
			showError(form, error)
			return
		}
		app.tournament = new Tournament(app, players)
		app.router.renderCurrentPage()
	})
}

export function renderTournamentForm(app: App) {
	app.showBackground()
	app.changeContent(tournamentFormHTML())
	initTournament(app)
}
