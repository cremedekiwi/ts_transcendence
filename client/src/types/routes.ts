import { App } from "../classes/App.js"
import { renderChat } from "../content/chat.js"
import { renderConfidentiality } from "../content/confidentiality.js"
import { renderHistory } from "../content/history.js"
import { renderHome } from "../content/home.js"
import { renderPlayers } from "../content/players.js"
import { pongRenderer } from "../content/pong/pong.js"
import { renderProfil } from "../content/profil.js"
import { renderStats } from "../content/stats.js"
import { renderTournament } from "../content/tournament/tournament.js"

export type routeType = {
	renderer: viewRenderer
	title: string
	path: string // Store original path pattern like '/chat/:id'
	authorization: authorizationType
}

export type viewRenderer = (app: App, params?: routeParams) => void

export type routeParams = Record<string, string>

export type authorizationType = "everyone" | "loggedIn" | "loggedOut"

const placeholderRenderer = (app: App) => {
	app.changeContent(/* HTML */ `<p class="text-center">Not implemented yet</p>`)
	app.hideBackground()
}

const backgroundRenderer = (app: App) => {
	app.changeContent(/* HTML */ `<p class="text-center">Background page placeholder</p>`)
	app.showBackground()
}

export const routes: routeType[] = [
	// Public routes
	{ path: "/", title: "Accueil", renderer: renderHome, authorization: "everyone" as authorizationType },
	{ path: "/options", title: "Options", renderer: placeholderRenderer, authorization: "everyone" as authorizationType },
	{ path: "/options/:tournament", title: "Options2", renderer: placeholderRenderer, authorization: "everyone" as authorizationType },
	{ path: "/tournament", title: "Tournoi", renderer: renderTournament, authorization: "everyone" as authorizationType },
	{ path: "/players", title: "Joueurs", renderer: renderPlayers, authorization: "everyone" as authorizationType },
	{ path: "/profil/:?username", title: "Profil", renderer: renderProfil, authorization: "everyone" as authorizationType },
	{ path: "/history/:?username", title: "Historique", renderer: renderHistory, authorization: "everyone" as authorizationType },
	{ path: "/stats/:?username", title: "Statistique", renderer: renderStats, authorization: "everyone" as authorizationType },
	{ path: "/pong", title: "Pong", renderer: pongRenderer, authorization: "everyone" as authorizationType },
	{
		path: "/confidentiality",
		title: "Politique de confidentialite",
		renderer: renderConfidentiality,
		authorization: "everyone" as authorizationType,
	},

	// LoggedOut routes
	{ path: "/register", title: "Inscription", renderer: placeholderRenderer, authorization: "loggedOut" as authorizationType },

	// LoggedIn routes
	{ path: "/settings", title: "Parametres", renderer: placeholderRenderer, authorization: "loggedIn" as authorizationType },
	{ path: "/chat/:id", title: "Chat", renderer: renderChat, authorization: "loggedIn" as authorizationType },
	{ path: "/online", title: "Online", renderer: placeholderRenderer, authorization: "loggedIn" as authorizationType },
]
