export interface GameOptions {
	ballSpeed: number
	ballRadius: number
	ballAcceleration: number
	paddleSpeed: number
	paddleSize: number
	maxScore: number
}

export const defaultOptions: GameOptions = {
	ballSpeed: 5,
	ballRadius: 13,
	ballAcceleration: 0.5,
	paddleSpeed: 10,
	paddleSize: 120,
	maxScore: 3,
}
