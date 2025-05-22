import Game from "../../classes/Game/Game.js"
import { t } from "../../translations/translations.js"
import { Player } from "../../types/player.js"
import { getAvatarPath } from "../../utils/utils.js"

function readyBadge(ready: boolean, joined: boolean = true) {
	const text = ready ? t("ready") : joined ? t("notReady") : t("waiting")
	const textColor = ready ? "text-lime-500" : joined ? "text-orange-500" : "text-gray-500"
	const borderColor = ready ? "border-lime-700" : joined ? "border-orange-700" : "border-gray-700"

	return /* HTML */ ` <span class="${textColor} ${borderColor} border-2 px-3 py-1 font-bold"> ${text} </span> `
}

export function updateGamePlayers(game: Game) {
	const gamePlayers = document.getElementById("gamePlayers")
	if (!gamePlayers) return

	const player1Name = getPlayerName(game.player1)
	const player1Avatar = getPlayerAvatar(game.player1)
	const player2Name = getPlayerName(game.player2)
	const player2Avatar = getPlayerAvatar(game.player2)
	const player1Link = getPlayerLink(game.player1)
	const player2Link = getPlayerLink(game.player2)

	gamePlayers.innerHTML = /* HTML */ `
		<div id="player1" class="${player1Link ? "hover-effect group-event" : ""} flex w-fit items-center gap-4" ${player1Link ? player1Link : ""}>
			<img src="${player1Avatar}" class="avatar w-12" />
			<h2>${player1Name}</h2>
			${game.currentStep === "not-ready" ? readyBadge(game.player1Ready) : ""}
		</div>
		<img src="/assets/images/versus.png" class="mx-auto h-12" />
		<div
			id="player2"
			class="${game.player2Joined ? "" : "opacity-50"} ${player2Link
				? "hover-effect group-event"
				: ""} flex w-fit items-center gap-4 justify-self-end"
			${player2Link ? player2Link : ""}
		>
			${game.currentStep === "not-ready" || game.currentStep === "waiting-for-opponent"
				? readyBadge(game.player2Ready, game.player2Joined)
				: ""}
			<h2>${player2Name}</h2>
			<img src="${player2Avatar}" class="avatar w-12" />
		</div>
	`
}

export function getPlayerName(player?: Player, defaultName: string = "Unknown") {
	switch (player?.type) {
		case "remote":
			return player.user.username
		case "local":
		case "bot":
			return player.name
		default:
			return defaultName
	}
}

export function getPlayerAvatar(player?: Player) {
	switch (player?.type) {
		case "remote":
			return getAvatarPath(player.user.avatar)
		case "local":
			return "/assets/images/avatars/default.png"
		case "bot":
			return "/assets/images/avatars/bot.png"
		default:
			return "/assets/images/avatars/unknown.png"
	}
}

export function getPlayerLink(player?: Player) {
	if (player?.type !== "remote") return null

	return "data-link href=/profil/" + player.user.username
}
