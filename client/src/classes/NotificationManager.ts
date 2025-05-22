import { addUnreadMessage } from "../components/player_card.js"
import { joinLobby } from "../content/pong/pong.js"
import { t } from "../translations/translations.js"
import { GameOptions } from "../types/options.js"
import { User } from "../types/user.js"
import { getAvatarPath } from "../utils/utils.js"
import { App } from "./App.js"

type NotificationType = "login" | "logout" | "message" | "gameInvite" | "info"

interface Notification {
	id: string // Unique identifier
	user: User
	type: NotificationType
	message: string
	autoClose: boolean
	onClick?: () => void
	onClose?: () => void
	timestamp: number // For updating notifications
}

export default class NotificationManager {
	private root: HTMLElement
	private notifications: Notification[] = []
	private displayedNotifications: Notification[] = []
	private maxDisplayed = 5

	constructor(private app: App) {
		this.root = document.createElement("div")
		this.root.id = "notification-root"
		this.root.className = "fixed top-[64px] right-1 w-fit max-h-[80vh] z-[1000] p-4 flex flex-col gap-2"

		document.body.appendChild(this.root)
	}

	createNotificationElement(notification: Notification): HTMLElement {
		const notificationElement = document.createElement("div")
		notificationElement.id = `notification_${notification.id}`
		notificationElement.className = "notification-item flex items-center gap-4 bg-purple p-4 border"
		if (notification.onClick) notificationElement.classList.add("hover-effect")

		switch (notification.type) {
			case "login":
				notificationElement.classList.add("border-l-4", "border-green", "bg-opacity-20", "bg-lime-500", "shadow-sm")
				break
			case "logout":
				notificationElement.classList.add("border-l-4", "border-red", "bg-opacity-20", "bg-red", "shadow-sm")
				break
			case "message":
			case "info":
				notificationElement.classList.add("border-l-4", "border-yellow-500", "bg-opacity-20", "bg-yellow-500", "shadow-sm")
				break
			case "gameInvite":
				notificationElement.classList.add("border-l-4", "border-orange-500", "bg-opacity-20", "bg-orange-500", "shadow-sm")
				break
		}

		notificationElement.innerHTML = /* HTML */ `
			<img src="${getAvatarPath(notification.user.avatar)}" alt="${notification.user.username}" class="avatar h-12 w-12" />
			<div class="mr-6 flex-grow">
				<p class="font-semibold">${notification.user.username}</p>
				<p class="text-sm text-gray-200">${notification.message}</p>
			</div>
			<button data-close="${notification.id}" class="pointer-events-auto">
				<svg xmlns="http://www.w3.org/2000/svg" class="hover:stroke-berry h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		`

		// Add event listeners
		notificationElement.addEventListener("click", (e) => {
			const target = e.target as HTMLElement
			if (target.matches("[data-close]") || target.closest("button[data-close]")) {
				notification.onClose?.()
				this.removeNotification(notification.id)
			} else if (notification.onClick) {
				notification.onClick()
				this.removeNotification(notification.id)
			}
		})

		return notificationElement
	}

	/**
	 * Adds a notification to the queue.
	 * If a notification of the same type for the same user exists, it updates it.
	 * @param notification - The notification to add.
	 */
	addNotification(notification: Notification) {
		const existing = this.notifications.find((n) => n.user.id === notification.user.id && n.type === notification.type)

		// console.log("Adding notification:", notification)
		if (existing) {
			// Update the existing notification
			existing.message = notification.message
			existing.timestamp = Date.now()
			existing.autoClose = notification.autoClose
			existing.onClick = notification.onClick
			existing.onClose = notification.onClose
		} else {
			this.notifications.push({ ...notification, id: this.generateId(), timestamp: Date.now() })
		}

		this.updateDisplayedNotifications()
	}

	/**
	 * Removes a notification from the queue and updates the displayed notifications.
	 * @param id - The ID of the notification to remove.
	 */
	removeNotification(id: string) {
		const notification = this.notifications.find((n) => n.id === id)

		// Remove the notification from the list
		this.notifications = this.notifications.filter((n) => n.id !== id)
		this.displayedNotifications = this.displayedNotifications.filter((n) => n.id !== id)

		this.updateDisplayedNotifications()
	}

	/**
	 * Updates the displayed notifications to ensure only `maxDisplayed` are shown.
	 */
	private updateDisplayedNotifications() {
		this.displayedNotifications = this.notifications.slice(0, this.maxDisplayed)

		// Render/display notifications on the screen
		this.renderNotifications()
	}

	/**
	 * Renders the notifications on the screen.
	 */
	private renderNotifications() {
		this.root.innerHTML = "" // Clear previous notifications

		// Create a new notification element for each displayed notification
		this.displayedNotifications.forEach((notification) => {
			const notificationElement = this.createNotificationElement(notification)

			// Close button event
			notificationElement.querySelector(".close-btn")?.addEventListener("click", () => {
				this.removeNotification(notification.id)
			})

			this.root.appendChild(notificationElement)

			// Auto-close logic
			if (notification.autoClose) {
				setTimeout(() => {
					this.removeNotification(notification.id)
				}, 5000) // Auto-close after 5 seconds
			}
		})
	}

	/**
	 * Generates a unique ID for each notification.
	 */
	private generateId(): string {
		return Math.random().toString(36).substr(2, 9)
	}

	clearNotifications() {
		this.notifications = []
		this.displayedNotifications = []
		this.root.innerHTML = ""
	}

	// -------------------- Notification Handlers --------------------
	// -------------------- Notification Handlers --------------------
	// -------------------- Notification Handlers --------------------
	// -------------------- Notification Handlers --------------------

	loginNotification(userId: number) {
		const user = this.app.cache.getUser(userId)?.user
		if (user) {
			this.addNotification({
				user,
				type: "login",
				message: t("loggedIn"),
				autoClose: true,
				onClick: () => {
					this.app.router.navigate(`/profil/${user.username}`)
				},
			} as Notification)
		}
	}

	logoutNotification(userId: number) {
		const user = this.app.cache.getUser(userId)?.user
		if (user) {
			this.addNotification({
				user,
				type: "logout",
				message: t("loggedOut"),
				autoClose: true,
				onClick: () => {
					this.app.router.navigate(`/profil/${user.username}`)
				},
			} as Notification)
		}
	}

	chatNotification(senderId: number, message: string) {
		const userData = this.app.cache.getUser(senderId)
		if (userData) {
			this.addNotification({
				type: "message",
				user: userData.user,
				message: t("sentYouMessage"),
				autoClose: false,
				onClick: () => {
					this.app.router.navigate(`/chat/${userData.user.id}`)
				},
			} as Notification)
			userData.unreadMessages = (userData?.unreadMessages || 0) + 1
			addUnreadMessage(this.app, senderId)
		}
	}

	userIsOfflineNotification(userId: number) {
		const userData = this.app.cache.getUser(userId)
		if (userData) {
			this.addNotification({
				type: "info",
				user: userData.user,
				message: t("isOffline"),
				autoClose: true,
				onClick: () => {
					this.app.router.navigate(`/profil/${userData.user.username}`)
				},
			} as Notification)
		}
	}

	// Feedback that a game invite was sent
	sentGameInviteNotification(targetId: number) {
		const userData = this.app.cache.getUser(targetId)
		if (userData) {
			this.addNotification({
				type: "gameInvite",
				user: userData.user,
				message: t("wasInvited"),
				autoClose: true,
			} as Notification)
		}
	}

	// Notification for a received game invite
	gameInviteNotification(senderId: number, options: GameOptions) {
		const userData = this.app.cache.getUser(senderId)
		if (userData) {
			this.addNotification({
				type: "gameInvite",
				user: userData.user,
				message: t("invitedYou"),
				autoClose: false,
				onClick: () => joinLobby(this.app, userData.user, options),
				onClose: () => this.app.websocket.declineGameInvite(senderId),
			} as Notification)
		}
	}

	gameInviteCancelledNotification(senderId: number) {
		const userData = this.app.cache.getUser(senderId)
		if (userData) {
			this.addNotification({
				type: "gameInvite",
				user: userData.user,
				message: t("cancelGameInvite"),
				autoClose: true,
				onClick: () => {
					this.app.router.navigate(`/profil/${userData.user.username}`)
				},
			} as Notification)
		}
	}

	// Notification for an accepted game invite response
	gameInviteAcceptedNotification(senderId: number) {
		const userData = this.app.cache.getUser(senderId)
		if (userData) {
			this.addNotification({
				type: "gameInvite",
				user: userData.user,
				message: t("acceptedYourInvite"),
				autoClose: false,
				onClick: () => {
					this.app.router.navigate(`/pong`)
				},
			} as Notification)
		}
	}

	// Notification for a declined game invite response
	gameInviteDeclinedNotification(senderId: number) {
		const userData = this.app.cache.getUser(senderId)
		if (userData) {
			this.addNotification({
				type: "gameInvite",
				user: userData.user,
				message: t("declinedYourInvite"),
				autoClose: false,
			} as Notification)
		}
	}

	// -------------------- Other Methods --------------------
	// -------------------- Other Methods --------------------
	// -------------------- Other Methods --------------------
	// -------------------- Other Methods --------------------

	removeChatNotificationFromUser(userId: number) {
		const userData = this.app.cache.getUser(userId)
		if (userData) {
			userData.unreadMessages = 0
			const notification = this.displayedNotifications.find((n) => n.user.id === userId && n.type === "message")
			if (notification) {
				this.removeNotification(notification.id)
			}
		}
	}

	playerReadyNotification(userId: number) {
		const userData = this.app.cache.getUser(userId)
		if (userData) {
			this.addNotification({
				id: this.generateId(), // If needed
				type: "info",
				user: userData.user,
				message: t("isReady"),
				autoClose: true,
				onClick: () => {
					this.app.router.navigate(`/pong`)
				},
				timestamp: Date.now(), // If needed
			} as Notification)
		}
	}
}
