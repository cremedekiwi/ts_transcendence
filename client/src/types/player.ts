import { User } from "./user"

export type difficultyType = "easy" | "medium" | "hard" | "extreme"

export type LocalPlayer = { type: "local"; name: string }
export type RemotePlayer = { type: "remote"; user: User }
export type BotPlayer = { type: "bot"; name: string; difficulty: difficultyType }

// default bot
export const EASY_BOT: BotPlayer = { type: "bot", name: "Easy Bot", difficulty: "easy" }
export const MEDIUM_BOT: BotPlayer = { type: "bot", name: "Medium Bot", difficulty: "medium" }
export const HARD_BOT: BotPlayer = { type: "bot", name: "Hard Bot", difficulty: "hard" }
export const EXTREME_BOT: BotPlayer = { type: "bot", name: "Extreme Bot", difficulty: "extreme" }
export const DEFAULT_LOCAL_1: LocalPlayer = { type: "local", name: "Player 1" }
export const DEFAULT_LOCAL_2: LocalPlayer = { type: "local", name: "Player 2" }

export type Player = LocalPlayer | RemotePlayer | BotPlayer
