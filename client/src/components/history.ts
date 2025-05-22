import { App } from "../classes/App.js"
import { Match } from "../types/match.js"
import { getAvatarPath } from "../utils/utils.js"

export function convertToLocalTime(utcTime: string | Date): Date {
	const date = new Date(utcTime)
	const parisDate = new Date(date.getTime() + 2 * 60 * 60 * 1000)

	return parisDate
}

export function smallHistoryCard(username: string, match: Match): string {
	const isWinner = match.winner === username
	const date = convertToLocalTime(match.created_at!)
	const formattedDate = date.toLocaleDateString([], { year: "2-digit", month: "2-digit", day: "2-digit" })
	const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

	return /* HTML */ `
		<div class="border-berry flex h-[55.9px] w-full items-center justify-between border-b px-5 py-4 text-sm last:border-b-0">
			<div class="flex w-full items-center justify-center gap-4">
				<span class="${isWinner ? "text-green" : "text-red"} font-bold"> ${isWinner ? "✔" : "✘"} </span>
				<div id="player1" class="hover-effect flex items-center gap-2" data-link href="/profil/${match.player1}">
					<span class="pointer-events-none"> ${match.player1} </span>
					<span> ${match.score1} </span>
				</div>
				<span>-</span>
				<div id="player2" class="hover-effect flex items-center gap-2" data-link href="/profil/${match.player2}">
					<span> ${match.score2} </span>
					<span class="pointer-events-none"> ${match.player2} </span>
				</div>
			</div>
		</div>
	`
}

export function fullHistoryCard(app: App, username: string, match: Match): string {
	const isWinner = match.winner === username
	const date = convertToLocalTime(match.created_at!)
	const formattedDate = date.toLocaleDateString()
	const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

	const player1 = app.cache.getUserByUsername(match.player1)?.user
	const player2 = app.cache.getUserByUsername(match.player2)?.user

	if (!player1 || !player2) return ""

	return /* HTML */ `
		<div class="border-berry flex h-[55.9px] w-full items-center justify-between border-b px-5 py-4 text-sm">
			<div class="flex h-fit items-center gap-4">
				<div class="flex items-center gap-2">
					<span class="${isWinner ? "text-green" : "text-red"} font-bold"> ${isWinner ? "✔ V" : "✘ D"} </span>
				</div>

				<div id="player1" class="hover-effect flex w-28 items-center gap-2" data-link href="/profil/${player1.username}">
					<div class="flex-shrink-0">
						<img
							src="${getAvatarPath(player1.avatar)}"
							alt="Avatar"
							class="avatar pointer-events-none h-7 w-7 rounded-full object-cover"
						/>
					</div>
					<span class="pointer-events-none truncate">${player1.username} ${match.score1}</span>
				</div>
				<img src="/assets/images/versus.png" class="w-8" />
				<div id="player2" class="hover-effect flex w-28 items-center gap-2" data-link href="/profil/${player2.username}">
					<span class="pointer-events-none w-full truncate text-right">${match.score2} ${player2.username}</span>
					<div class="flex-shrink-0">
						<img
							src="${getAvatarPath(player2.avatar)}"
							alt="Avatar"
							class="avatar pointer-events-none h-7 w-7 rounded-full object-cover"
						/>
					</div>
				</div>
			</div>

			<div class="text-sm">
				<span class="text-gray-300">${formattedDate}</span>
				<span class="text-gray-300">${formattedTime}</span>
			</div>
		</div>
	`
}
