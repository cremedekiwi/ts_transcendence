import { User } from "../types/user.js"
import Background from "./Background.js"
import Cache from "./Cache.js"
import Content, { ContentType } from "./Content.js"
import Game from "./Game/Game.js"
import Navbar from "./Navbar.js"
import NotificationManager from "./NotificationManager.js"
import Popup from "./Popup.js"
import { Router } from "./Router.js"
import Server from "./Server.js"
import { Tournament } from "./Tournament.js"
import WebSocketClient from "./WebSocketClient.js"

export class App {
	// Config
	static URL: string
	public loggedUser?: User
	// Services
	public server: Server
	public router: Router
	public websocket: WebSocketClient
	public cache: Cache
	public notifications: NotificationManager
	// Elements
	public navbar: Navbar
	public content: Content
	public background: Background
	public popup: Popup
	// // States
	public tournament?: Tournament
	public game?: Game // Current game instance

	constructor() {
		// Initialize Services in appropriate order
		this.server = new Server(this)
		this.cache = new Cache(this)
		this.websocket = new WebSocketClient(this)
		this.router = new Router(this)
		this.notifications = new NotificationManager(this)

		// Initialize Elements
		this.navbar = new Navbar(this)
		this.background = new Background(this)
		this.content = new Content(this)
		this.popup = new Popup(this)
	}

	// Only start the app when everything is ready
	// Start everything elements same time to not get any weird visual glitches
	start() {
		const checkReady = () => {
			if (this.cache.ready && this.websocket.ready) {
				this.navbar.render()
				this.background.render()
				this.content.render()
				this.router.render()
				// console.log("App started")
			} else {
				setTimeout(checkReady, 100) // Retry after 100ms
			}
		}
		checkReady()
	}

	isLoggedIn(): boolean {
		return this.server.isLoggedIn
	}

	changeContent(content: ContentType) {
		this.content.setContent(content)
	}

	showBackground() {
		this.background.show()
	}

	hideBackground() {
		this.background.hide()
	}
}
