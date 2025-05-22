import { App } from "../classes/App.js"
import { initPlayerButtonEvents, playerCard } from "../components/player_card.js"
import { routeParams } from "../types/routes.js"
import { Chat, UserData } from "../types/user.js"
import { ChatMessage, ChatReply } from "../types/websocket.js"

function chatHTML(userData: UserData): string {
	const user = userData.user

	return /* HTML */ `
		<section class="small-size container">
			<div class="flex h-[57px] w-full text-sm font-bold">${playerCard(userData, false)}</div>
			<div class="flex h-[calc(100%-57px)] flex-col justify-between">
				<div id="chatMessages" data-dummy="true" class="no-scrollbar m-5 flex flex-col gap-5 overflow-y-auto text-sm">
					<div class="bg-berry ml-auto h-[32px] w-1/2 rounded-lg"></div>
					<div class="bg-violet h-[32px] w-1/2 rounded-lg"></div>
					<div class="bg-berry ml-auto h-[32px] w-1/2 rounded-lg"></div>
					<div class="bg-violet h-[32px] w-1/2" rounded-lg></div>
					<div class="bg-berry ml-auto h-[32px] w-1/2 rounded-lg"></div>
					<div class="bg-violet h-[32px] w-1/2 rounded-lg"></div>
					<div class="bg-berry ml-auto h-[32px] w-1/2 rounded-lg"></div>
				</div>
				<form id="chatForm" class="flex">
					<input
						type="text"
						id="messageInput"
						name="message"
						class="w-3/4 p-2 text-black focus:bg-gray-200 focus:outline-none"
						data-target-id="${user.id}"
						${user.status != "online" ? "disabled" : ""}
					/>
					<button type="submit" id="messageSubmit" class="bg-berry w-1/4 px-1 py-2" ${user.status != "online" ? "disabled" : ""}>
						Send
					</button>
				</form>
			</div>
		</section>
	`
}

// Checks if we're in the page corresponding to the chat
// If the chat is a reply, we need to be in the correct /chat/:id else we create a notif
// If the chat is a message, we only need the /chat
function isInCorrectChatPage(app: App, chatMessage: Chat) {
	const path = window.location.pathname.split("/")
	if (isReply(chatMessage)) {
		if (path[1] === "chat" && Number(path[2]) === chatMessage.senderId) {
			return true
		} else {
			// Send a notification
			app.notifications.chatNotification(chatMessage.senderId, chatMessage.message)
			return false
		}
	} else {
		return path[1] === "chat"
	}
}

function isReply(chat: Chat): chat is ChatReply {
	return (chat as ChatReply).senderId !== undefined
}

export function appendNewChatMessage(app: App, chatMessage: Chat) {
	// Checks that we're in the chat overlay
	if (!isInCorrectChatPage(app, chatMessage)) return

	const container = document.getElementById("chatMessages") as HTMLElement
	if (!container) return

	const messageDiv = document.createElement("div")
	// Layout
	messageDiv.classList.add("inline-block", "p-2", "w-fit", "max-w-[90%]", "break-words", "rounded-lg")

	if (isReply(chatMessage)) {
		messageDiv.classList.add("bg-violet")
	} else {
		messageDiv.classList.add("bg-berry", "ml-auto")
	}

	// Safely set text content to prevent from XSS attacks(escapes HTML automatically)
	messageDiv.textContent = chatMessage.message
	// If fake messages are there, remove them
	if (container.getAttribute("data-dummy") === "true") {
		container.innerHTML = ""
		container.setAttribute("data-dummy", "false")
	}
	container.appendChild(messageDiv)
	container.scrollTop = container.scrollHeight
}

function initChatEvents(app: App) {
	document.getElementById("chatForm")?.addEventListener("submit", (e) => {
		e.preventDefault()
		const input = document.getElementById("messageInput") as HTMLInputElement

		const content = input.value.trim()
		const target = input?.getAttribute("data-target-id")

		if (!content) {
			console.error("Can't send an empty message")
		} else if (!target) {
			console.error("Message has no target")
		} else {
			const chat: ChatMessage = { type: "chat", targetId: Number(target), message: content }
			app.websocket.send(chat)
			app.cache.addMessage(chat.targetId, chat)
			input.value = ""
		}
	})
}

export function switchChatInput(id: number, enable: boolean) {
	// console.log(`Switching ${id} to be ${enable}`)
	// Check that we're in the correct chat
	const messageInput = document.querySelector(`#messageInput`) as HTMLInputElement
	const messageSubmit = document.querySelector(`#messageSubmit`) as HTMLButtonElement
	if (!messageInput || !messageSubmit) return
	const userId = Number(messageInput.getAttribute("data-target-id"))
	if (userId != id) return

	// Disable or enable the input
	messageInput.disabled = !enable
	messageSubmit.disabled = !enable
}

export function renderChat(app: App, params?: routeParams) {
	app.showBackground()
	// Check the id in the URL and if it's not the logged user
	const id = Number(params?.id)
	if (!params?.id || id === app.loggedUser?.id) {
		app.router.notFound()
		return
	}

	// Check if the user exists
	const userData = app.cache.getUser(id)
	if (!userData) {
		app.router.notFound()
		return
	}

	app.changeContent(chatHTML(userData))

	// Add the stored messages in the container
	app.cache.getConversation(Number(params.id))?.forEach((chat) => appendNewChatMessage(app, chat))
	initPlayerButtonEvents(app)
	initChatEvents(app)

	// Remove the notification if it exists
	app.notifications.removeChatNotificationFromUser(id)
}
