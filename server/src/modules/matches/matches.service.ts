import Game from "../Game/Game.js"
import { getUserById } from "../users/users.model.js"
import { Match, createMatch, getAllMatches, getMatchesByUser } from "./matches.model.js"

/**
 * Create a new match.
 */
export function registerMatch(match: Match): void {
	createMatch(match)
}

/**
 * Retrieve all matches.
 */
export function fetchAllMatches(): Match[] {
	return getAllMatches()
}

/**
 * Retrieve matches for a specific user.
 */
export function fetchMatchesByUser(username: string): Match[] {
	return getMatchesByUser(username)
}

export function registerGame(game: Game): void {
	// Fetch usernames from ids
	const player1 = getUserById(game.player1Id)
	const player2 = getUserById(game.player2Id)

	// Create match object
	const match: Match = {
		player1: player1.username,
		player2: player2.username,
		winner: game.winner! === game.player1Id ? player1.username : player2.username,
		score1: game.state.score1,
		score2: game.state.score2,
		duration: Math.floor(game.duration / 1000), // duration in seconds
	}
	// console.log("create match result : ", createMatch(match))
}
