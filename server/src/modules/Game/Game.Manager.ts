import { printGame } from "../../utils/game_utils.js"
import { log } from "../../utils/logger.js"
import { registerGame } from "../matches/matches.service.js"
import Game, { GameOptions } from "./Game.js"

export interface GameInvite {
	player1Id: number
	player2Id: number
	options: GameOptions
}

class GameManager {
	private games: Set<Game> = new Set()
	private intervalId?: NodeJS.Timeout

	// Store game invites
	private invites: GameInvite[] = []

	constructor() {
		this.startGameLoop()
	}

	/**
	 * Adds a game to the manager.
	 * @param game - The game to add.
	 */
	addGame(game: Game): boolean {
		// Check if either player is already in an active game
		for (const existingGame of this.games) {
			if (
				existingGame.player1Id === game.player1Id ||
				existingGame.player1Id === game.player2Id ||
				existingGame.player2Id === game.player1Id ||
				existingGame.player2Id === game.player2Id
			) {
				console.warn("A player is already in an active game. Cannot add duplicate game.")
				return false // Indicate that the game was not added
			}
		}

		// Add the game if no conflicts are found
		this.games.add(game)
		log("Game added to the manager:")
		printGame(game)

		return true // Indicate that the game was successfully added
	}

	/**
	 * Removes a game from the manager.
	 * @param game - The game to remove.
	 */
	removeGame(game: Game) {
		this.games.delete(game)
		log("Game removed from the manager:")
		printGame(game)
	}

	/**
	 * Finds a game by a player's ID.
	 * @param playerId - The ID of the player to search for.
	 * @returns The game the player is part of, or null if not found.
	 */
	findGameByPlayerId(playerId: number): Game | null {
		for (const game of this.games) {
			if (game.player1Id === playerId || game.player2Id === playerId) {
				return game
			}
		}
		return null
	}

	/**
	 * Gets all active games.
	 * @returns A list of all games.
	 */
	getAllGames(): Game[] {
		return Array.from(this.games)
	}

	/**
	 * Adds a new invite. A user (as player1) can only have one outgoing invite at a time.
	 * @param invite - The game invite to add.
	 */
	addInvite(invite: GameInvite) {
		// Remove any existing invite where this user is player1
		this.invites = this.invites.filter((existing) => existing.player1Id !== invite.player1Id)
		this.invites.push(invite)
	}

	/**
	 * Removes an invite by player1Id and player2Id.
	 * @param player1Id - The ID of the first player.
	 * @param player2Id - The ID of the second player.
	 */
	removeInvite(player1Id: number, player2Id: number) {
		this.invites = this.invites.filter((invite) => !(invite.player1Id === player1Id && invite.player2Id === player2Id))
	}

	/**
	 * Gets all invites for a player.
	 * @param playerId - The ID of the player to search for.
	 * @returns A list of game invites for the player.
	 */
	getInvitesForPlayer(playerId: number): GameInvite[] {
		return this.invites.filter((invite) => invite.player1Id === playerId || invite.player2Id === playerId)
	}

	getSpecificInvite(player1Id: number, player2Id: number): GameInvite | null {
		for (const invite of this.invites) {
			if (invite.player1Id === player1Id && invite.player2Id === player2Id) {
				return invite
			}
		}
		return null
	}

	/**
	 * Starts the centralized game loop to update all games at 60 FPS.
	 */
	startGameLoop(): void {
		if (this.intervalId) {
			console.warn("Game loop is already running.")
			return
		}

		this.intervalId = setInterval(() => {
			// if (this.games.size !== 0) {
			// 	log(`${this.games.size} active game(s)`)
			// }
			for (const game of this.games) {
				if (game.currentStep === "playing") {
					game.state.update() // Update the game state
					game.sendGameState() // Send the game state to the players
				} else if (game.currentStep === "done") {
					registerGame(game) // Store the game result in database
					this.removeGame(game) // Remove the game if it's done
					game.sendGameState() // Send the final game state to the players
				}
			}
		}, 1000 / 60) // 60 FPS
	}

	/**
	 * Stops the centralized game loop.
	 */
	stopGameLoop(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId)
			this.intervalId = undefined
			// console.log("Game loop stopped.")
		}
	}
}

export default new GameManager()
