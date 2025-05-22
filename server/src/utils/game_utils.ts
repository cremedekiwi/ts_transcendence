import Game, { GameOptions } from "../modules/Game/Game.js"
import { getUserById } from "../modules/users/users.service.js"
import { log } from "./logger.js"

export const defaultOptions: GameOptions = {
	ballSpeed: 5,
	ballRadius: 13,
	ballAcceleration: 0.5,
	paddleSpeed: 10,
	paddleSize: 100,
	maxScore: 3,
}

// Function to print the game on the console with all the data in a readable way
export function printGame(game: Game) {
	const user1 = getUserById(game.player1Id)
	const user2 = getUserById(game.player2Id)
	if (!user1 || !user2) {
		log("One of the players is not found")
		return
	}
	const winner = game.winner ? (getUserById(game.winner) ?? null) : null

	log("-------------------------------------------------------------------------")
	log("Game Details:")
	log("Players:")
	log(`  Player 1: ${user1.username || "Not assigned"}`)
	log(`  Player 2: ${user2.username || "Not assigned"}`)
	log(`  Player 1 Ready: ${game.player1Ready}`)
	log(`  Player 2 Ready: ${game.player2Ready}`)
	log("Game Configuration:")
	log(`  Ball Speed: ${game.options.ballSpeed}`)
	log(`  Ball Radius: ${game.options.ballRadius}`)
	log(`  Ball Acceleration: ${game.options.ballAcceleration}`)
	log(`  Paddle Speed: ${game.options.paddleSpeed}`)
	log(`  Paddle Size: ${game.options.paddleSize}`)
	log(`  Max Score: ${game.options.maxScore}`)
	log("Game State:")
	log(`  Current Step: ${game.currentStep}`)
	// Player scores
	log(`  Player 1 Score: ${game.state.score1}`)
	log(`  Player 2 Score: ${game.state.score2}`)
	log(`  Winner: ${winner?.username || "No winner yet"}`)
	log("-------------------------------------------------------------------------")
}
