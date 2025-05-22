import { App } from "../classes/App.js"
import Game from "../classes/Game/Game.js"
import { DEFAULT_LOCAL_1 } from "../types/player.js"
import { UserData } from "../types/user.js"
import { getAvatarPath } from "../utils/utils.js"

export function playerCard(userData: UserData, showChat: boolean = true): string {
	const { user, relationship, unreadMessages } = userData

	const addButton =
		relationship != "friend"
			? `<img src="/assets/images/icons/add.png" class="w-[24px]" alt="Add friend" data-action="friend" data-user-id="${user.id}" />`
			: `<img src="/assets/images/icons/unfriend.png" class="w-[24px]" alt="Remove friend" data-action="unfriend" data-user-id="${user.id}" />`
	const blockButton =
		relationship != "blocked"
			? `<img src="/assets/images/icons/block.png" class="w-[24px]" alt="Block" data-action="block" data-user-id="${user.id}" />`
			: `<img src="/assets/images/icons/unblock.png" class="w-[24px]" alt="Unblock" data-action="unblock" data-user-id="${user.id}" />`

	return /* HTML */ `
		<article
			data-player-card=${user.id}
			data-username=${user.username}
			class="border-berry flex min-h-[55.9px] w-full items-center justify-between border-b px-4"
		>
			<div id="user-info" class="group flex items-center gap-4" data-link href="/profil/${user.username}">
				<div class="relative">
					<img src="${getAvatarPath(user.avatar)}" class="avatar hover-effect pointer-events-none w-9" alt="${user.username}" />
					<div data-status="${user.status}" class="avatar pointer-events-none absolute bottom-0 right-0 w-3"></div>
				</div>
				<span class="pointer-events-none w-[9ch] truncate font-bold">${user.username}</span>
			</div>
			<div id="user-buttons" class="flex items-center gap-4">
				${showChat
					? /*HTML*/ `
						<button class="hover-effect relative">
							<img src="/assets/images/icons/msg.png" class="w-[24px]" alt="Message"  data-link href="/chat/${user.id}">
							<div data-unread="${user.id}" class="${unreadMessages ? "" : "hidden"} absolute w-2 bottom-0 right-0 avatar pointer-events-none bg-orange-500"></div>
						</button>
					`
					: ""}
				<img src="/assets/images/icons/defy.png" class="w-[24px] cursor-pointer" alt="Defy" data-action="defy" data-user-id="${user.id}" />
				<button class="hover-effect">${addButton}</button>
				<button class="hover-effect">${blockButton}</button>
			</div>
		</article>
	`
}

export function switchPlayerCardStatus(app: App, id: number, newStatus: "online" | "offline") {
	let playerCardElem = document.querySelector(`[data-player-card="${id}"]`) as HTMLElement

	// Create the card if it does not exists (useful for new registration)
	if (!playerCardElem) {
		const userData = app.cache.getUser(id)
		// console.log("New player card user data : ", userData)
		if (!userData) return

		const cardHTML: string = playerCard(userData, true)

		playerCardElem = document.createElement("div")
		playerCardElem.innerHTML = cardHTML
	}

	const statusDiv = playerCardElem?.querySelector(`[data-status]`) as HTMLElement

	if (!statusDiv) return

	// Update the status attribute
	statusDiv.setAttribute("data-status", newStatus)
	// console.log(`New status for ${id} : ${newStatus}`)

	// moves the card to the new position
	const playersList = document.getElementById("players-list")
	if (!playersList) return

	// console.log(playerCardElem)
	playerCardElem.remove()
	// console.log(playerCardElem)

	if (newStatus === "online") {
		// Find the first offline card to insert before it
		const firstOffline = playersList.querySelector('[data-status="offline"]')?.closest("[data-player-card]")
		if (firstOffline) {
			playersList.insertBefore(playerCardElem, firstOffline)
		} else {
			// If no offline card found, append to the end
			playersList.appendChild(playerCardElem)
		}
	} else {
		// Append to the end (offline area)
		playersList.appendChild(playerCardElem)
	}
}

export function addUnreadMessage(app: App, userId: number) {
	const unreadDiv = document.querySelector(`[data-unread="${userId}"]`) as HTMLElement
	if (!unreadDiv) return
	unreadDiv.classList.remove("hidden")
}

export function initPlayerButtonEvents(app: App) {
	// Listen for clicks in the players list container
	document.querySelectorAll("[data-player-card]").forEach((card) => {
		card.addEventListener("click", async (event) => {
			const target = event.target as HTMLElement
			const userId = target.getAttribute("data-user-id")
			const action = target.getAttribute("data-action")

			// Ignore clicks on the logged-in user's card
			if (app.loggedUser?.id === Number(userId)) {
				return
			}

			if (userId && action) {
				const targetId = Number(userId)
				const playerCard = target.closest("[data-player-card]") as HTMLElement
				const username = playerCard?.getAttribute("data-username") || "Player"

				switch (action) {
					case "friend":
						// Send a POST request to add as a friend
						await app.server.modifyRelationshipRequest(targetId, "friend")
						break
					case "unfriend":
					case "unblock":
						// Send a POST request to remove relationship
						await app.server.modifyRelationshipRequest(targetId, null)
						break
					case "block":
						// Send a POST request to block the user
						await app.server.modifyRelationshipRequest(targetId, "blocked")
						break
					case "defy":
						// Send a game invitation via WebSocket
						handleDefy(app, targetId, username)
						break
				}
			}
		})
	})
}

// Handle defy action (redirects to pre-configured game)
function handleDefy(app: App, targetId: number, username: string) {
	if (!app.isLoggedIn()) {
		app.popup.callHandler("connect")
		return
	}

	// Can't defy if already in a remote game
	if (app.game?.gameMode === "remote") {
		app.router.navigate("/pong")
		return
	}

	const targetUser = app.cache.getUser(targetId)
	if (!targetUser) return

	if (targetUser.user.status !== "online") {
		app.notifications.userIsOfflineNotification(targetId)
		return
	}
	app.game = new Game(app)
	app.game.setPlayer(1, app.loggedUser ? { type: "remote", user: app.loggedUser } : DEFAULT_LOCAL_1)
	app.game.setPlayer(2, { type: "remote", user: targetUser.user })
	app.router.navigate("/pong")
}
