// chart.ts
import type { Chart as ChartType } from "chart.js"
import { t } from "../translations/translations.js"
import { Match } from "../types/match.js"

declare const Chart: typeof ChartType

/*
 * Charts for the statistics
 * DONE: Win/Loss -> Pie chart
 * DONE: Score over games -> Line chart
 * DONE: Duration over games -> Bar chart
 * DONE: Most played users -> Polar area chart
 * */

const WHITE = "#FFFFFF"
const VIOLET = "#940AA6"
const GRAD = ["#f72585", "#7209b7", "#3a0ca3", "#4361ee", "#4cc9f0"]

const genericOptions = (title: string = "") => {
	return {
		borderColor: WHITE,
		plugins: {
			title: {
				display: title != "",
				text: title,
				color: WHITE,
				font: {
					size: 16,
					family: "Anonymous Pro",
				},
				padding: 8,
			},
			legend: {
				labels: {
					color: WHITE,
				},
			},
		},
		layout: {
			padding: 24,
		},
		scales: {
			x: {
				ticks: {
					color: WHITE,
					display: false,
				},
				grid: {
					display: false,
				},
			},
			y: {
				ticks: {
					color: WHITE,
				},
				grid: {
					color: VIOLET,
				},
			},
		},
	}
}

// Function to create a Win/Loss Ratio Pie Chart
export function createWinLossChart(wins: number = 10, losses: number = 5) {
	const ctx = document.getElementById("winLossChart") as HTMLCanvasElement
	if (!ctx) return

	const chartData = {
		labels: [`${wins} ${t("wins")}`, `${losses} ${t("losses")}`],
		datasets: [
			{
				data: [wins, losses],
				backgroundColor: GRAD,
			},
		],
	}

	let options = genericOptions(t("winrate")) as any
	delete options.scales

	new Chart(ctx, {
		type: "pie",
		options: options,
		data: chartData,
	})
}

// Function to create a score per game line chart
export function createScorePerGameChart(username: string = "", matches: Match[] = []) {
	const ctx = document.getElementById("scorePerGameChart") as HTMLCanvasElement
	if (!ctx) return

	// Use the last 100 matches
	matches = matches.reverse().slice(0, 100)

	const scoreData: { x: string; y: number }[] = matches.map((match) => {
		let playerScore = match.player1 === username ? match.score1 : match.score2
		let date = new Date(match.created_at!)
		return { x: match.id!.toString(), y: playerScore }
	})
	const opponentScoreData: { x: string; y: number }[] = matches.map((match) => {
		let opponentScore = match.player1 !== username ? match.score1 : match.score2
		let date = new Date(match.created_at!)
		return { x: match.id!.toString(), y: opponentScore }
	})

	const chartData = {
		datasets: [
			{
				label: t("yourScore"),
				data: scoreData,
				backgroundColor: GRAD[0],
				borderColor: GRAD[0],
			},
			{
				label: t("yourOpponent"),
				data: opponentScoreData,
				backgroundColor: GRAD[1],
				borderColor: GRAD[1],
			},
		],
	}

	let options = genericOptions(t("scorePerGame")) as any
	// options.plugins.legend.display = false

	new Chart(ctx, {
		type: "line",
		options: options,
		data: chartData,
	})
}

export function createDurationPerGameChart(matches: Match[]) {
	const ctx = document.getElementById("durationPerGameChart") as HTMLCanvasElement
	if (!ctx) return

	// Use the last 100 matches
	matches = matches.reverse().slice(0, 100)

	const xyData: { x: string; y: number }[] = matches.map((match) => {
		let date = new Date(match.created_at!)
		return { x: match.id!.toString(), y: match.duration }
	})

	const chartData = {
		datasets: [
			{
				label: t("durationPerGame"),
				data: xyData,
				backgroundColor: [GRAD[4]],
				borderColor: GRAD[1],
			},
		],
	}

	let options = genericOptions(t("durationPerGame")) as any
	options.plugins.legend.display = false

	new Chart(ctx, {
		type: "bar",
		options: options,
		data: chartData,
	})
}

export function createMostPlayedUsersChart(username: string, matches: Match[]) {
	const ctx = document.getElementById("mostPlayedUsersChart") as HTMLCanvasElement
	if (!ctx) return

	// Calculate the number of games played against each opponent
	const opponentCounts: Record<string, number> = {}
	matches.forEach((match) => {
		const opponent = match.player1 === username ? match.player2 : match.player1
		opponentCounts[opponent] = (opponentCounts[opponent] || 0) + 1
	})

	// Sort opponents by the number of games played and take the top 5
	const mostPlayedOpponents = Object.entries(opponentCounts)
		.sort((a, b) => b[1] - a[1]) // Sort by number of games in descending order
		.slice(0, 5) // Take the top 5
		.map(([name, games]) => ({ name, games })) // Return the name and number of games

	const chartData = {
		labels: mostPlayedOpponents.map((opponent) => opponent.name),
		datasets: [
			{
				label: t("mostPlayedUsers"),
				data: mostPlayedOpponents.map((opponent) => opponent.games),
				backgroundColor: GRAD,
			},
		],
	}

	let options = genericOptions(t("mostPlayedUsers")) as any
	options.scales = {
		r: {
			display: false,
		},
	}

	new Chart(ctx, {
		type: "polarArea",
		options: options,
		data: chartData,
	})
}
