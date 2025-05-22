import { GameOptions, defaultOptions } from "../types/options.js"

export class OptionsManager {
	private options: GameOptions
	private storage: Storage
	private prefix: string

	constructor(storage: Storage = localStorage, prefix: string = "pong_") {
		this.storage = storage
		this.prefix = prefix
		this.options = this.loadAllOptions()
	}

	// Load all options from storage or use defaults
	private loadAllOptions(): GameOptions {
		return {
			ballSpeed: this.loadOption("ballSpeed", defaultOptions.ballSpeed),
			ballRadius: this.loadOption("ballRadius", defaultOptions.ballRadius),
			ballAcceleration: this.loadOption("ballAcceleration", defaultOptions.ballAcceleration),
			paddleSpeed: this.loadOption("paddleSpeed", defaultOptions.paddleSpeed),
			paddleSize: this.loadOption("paddleSize", defaultOptions.paddleSize),
			maxScore: this.loadOption("maxScore", defaultOptions.maxScore),
		}
	}

	// Load a single option from storage
	public loadOption<T>(key: string, defaultValue: T): T {
		const savedValue = this.storage.getItem(`${this.prefix}${key}`)

		if (savedValue === null) {
			return defaultValue
		}

		if (typeof defaultValue === "number") {
			return Number(savedValue) as number as T
		} else if (typeof defaultValue === "boolean") {
			return (savedValue === "true") as boolean as T
		} else {
			return savedValue as unknown as T
		}
	}

	// Get a single option
	public getOption<K extends keyof GameOptions>(key: K): GameOptions[K] {
		return this.options[key]
	}

	// Get all options
	public getOptions(): GameOptions {
		return { ...this.options } // Return a copy to prevent direct mutation
	}

	// Save a single option
	public saveOption<K extends keyof GameOptions>(key: K, value: GameOptions[K]): void {
		this.options[key] = value
		this.storage.setItem(`${this.prefix}${key}`, value.toString())
	}

	// Save all options
	public saveOptions(options: Partial<GameOptions>): void {
		for (const key in options) {
			if (options.hasOwnProperty(key)) {
				const typedKey = key as keyof GameOptions
				this.saveOption(typedKey, options[typedKey] as GameOptions[typeof typedKey])
			}
		}
	}

	// Reset options to defaults
	public resetOptions(): void {
		this.options = { ...defaultOptions }

		// Clear storage
		Object.keys(this.storage)
			.filter((key) => key.startsWith(this.prefix))
			.forEach((key) => this.storage.removeItem(key))
	}

	// Check if tournament options are set
	public isOptionSet(key: string): boolean {
		return this.storage.getItem(key) !== null
	}

	// Set a flag
	public setFlag(key: string, value: string): void {
		this.storage.setItem(key, value)
	}
}

// Create a singleton instance
export const optionsManager = new OptionsManager()
