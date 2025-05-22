import { App } from "../../classes/App.js"
import { currentStepType } from "../../classes/Game/Game.js"
import { optionsManager } from "../../classes/Options.js"
import { customButtonNoTranslate } from "../../components/buttons.js"
import { option } from "../../components/option.js"
import { t } from "../../translations/translations.js"
import { GameOptions } from "../../types/options.js"

export function optionsPopupHTML(currentStep: currentStepType | undefined): string {
	const savedOptions = optionsManager.getOptions()

	const isReadOnly: boolean = (currentStep && currentStep !== "configuring") as boolean

	const content = /* HTML */ `
		<section class="small-size-grow container">
			<div class="custom-scrollbar flex h-full flex-col items-center overflow-auto text-sm">
				${option("ballSpeed", t("ballSpeed"), savedOptions.ballSpeed, 1, 15, 1, isReadOnly)}
				${option("ballRadius", t("ballRadius"), savedOptions.ballRadius, 5, 30, 1, isReadOnly)}
				${option("ballAcceleration", t("ballAcceleration"), savedOptions.ballAcceleration, 0.0, 2.0, 0.1, isReadOnly)}
				${option("paddleSpeed", t("paddleSpeed"), savedOptions.paddleSpeed, 5, 15, 1, isReadOnly)}
				${option("paddleSize", t("paddleSize"), savedOptions.paddleSize, 50, 200, 1, isReadOnly)}
				${option("maxScore", t("maxScore"), savedOptions.maxScore, 1, 10, 1, isReadOnly)}
			</div>
			<div class="border-berry bg-berry/20 divide-berry flex min-h-[60px] divide-x-2 border-t text-base font-bold">
				${customButtonNoTranslate(
					t("reset"),
					"bg-berry/20 hover:bg-berry w-1/2",
					`id='reset-options' ${isReadOnly ? " disabled" : ""}`,
				)}
				${customButtonNoTranslate(
					t("confirmOptions"),
					"bg-berry/20 hover:bg-berry w-1/2",
					`id='confirm-options'${isReadOnly ? " disabled" : ""}`,
				)}
			</div>
		</section>
	`

	return content
}

function saveOptions(): boolean {
	// Get values from elements with data-slider attribute
	const sliderContainers = document.querySelectorAll("[data-slider]")
	let optionsSaved = false
	const newOptions: Partial<GameOptions> = {}

	sliderContainers.forEach((container) => {
		const optionName = container.getAttribute("data-slider")

		if (!optionName || optionName === "") {
			return
		}

		const sliderInput = container.querySelector('input[type="range"]') as HTMLInputElement

		if (sliderInput) {
			const value = parseFloat(sliderInput.value)
			newOptions[optionName as keyof GameOptions] = value
			optionsSaved = true
		} else {
			console.warn(`No range input found for ${optionName}`)
		}
	})

	if (optionsSaved) {
		optionsManager.saveOptions(newOptions)
		optionsManager.setFlag("tournamentOptionsSet", "true")
	}

	return optionsSaved
}

function initSliders(app: App) {
	if (app.game && app.game.currentStep !== "configuring") return

	// Handle slider synchronization
	document.querySelectorAll("[data-slider]").forEach((container) => {
		const sliderInput = container.querySelector('input[type="range"]') as HTMLInputElement
		const numberInput = container.querySelector('input[type="number"]') as HTMLInputElement

		if (!sliderInput || !numberInput) return

		// Set up two-way binding between inputs
		const syncInputs = (source: HTMLInputElement, target: HTMLInputElement) => {
			target.value = source.value
		}

		// Validate number input stays within bounds
		const validateNumberInput = () => {
			const value = Number(numberInput.value)
			const min = Number(numberInput.min)
			const max = Number(numberInput.max)

			numberInput.value = String(Math.min(Math.max(value, min), max))
			sliderInput.value = numberInput.value
		}

		// Event listeners
		sliderInput.addEventListener("input", () => syncInputs(sliderInput, numberInput))
		numberInput.addEventListener("input", () => syncInputs(numberInput, sliderInput))
		numberInput.addEventListener("change", validateNumberInput)
	})

	// Set up buttons with simpler event handling
	const setupButton = (selector: string, handler: (e: Event) => void) => {
		const button = document.querySelector(selector)
		if (button) button.addEventListener("click", handler)
		return !!button
	}

	// Confirm button handler
	setupButton("#confirm-options", (event) => {
		event.preventDefault()
		if (saveOptions()) {
			app.game?.updateOptions()
			app.background.game?.updateOptions()
			app.popup.close()
		}
	}) || console.error("Confirm button not found!")

	// Reset button handler
	setupButton("#reset-options", (event) => {
		// console.log("Reset button clicked")
		event.preventDefault()
		resetOptionsToDefault()
	})
}

function resetOptionsToDefault() {
	optionsManager.resetOptions()

	// Update UI
	document.querySelectorAll("[data-slider]").forEach((container) => {
		const optionName = container.getAttribute("data-slider")

		if (!optionName || optionName === "") {
			return
		}

		const defaultValue = optionsManager.getOptions()[optionName as keyof GameOptions]

		if (defaultValue !== undefined) {
			const sliderInput = container.querySelector('input[type="range"]') as HTMLInputElement
			const numberInput = container.querySelector('input[type="number"]') as HTMLInputElement

			if (sliderInput && numberInput) {
				sliderInput.value = String(defaultValue)
				numberInput.value = String(defaultValue)
			}
		}
	})
}

export function optionsPopup(app: App) {
	const isTournamentOptionsSet = optionsManager.isOptionSet("tournamentOptionsSet")
	if (isTournamentOptionsSet && window.location.pathname === "/options/tournament") {
		app.router.navigate("/tournament")
		return
	}
	app.popup.open(optionsPopupHTML(app.game?.currentStep))
	initSliders(app)
}
