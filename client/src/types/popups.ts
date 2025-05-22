import { App } from "../classes/App.js"
import { connectPopup } from "../content/connect_popup.js"
import { languagePopup } from "../content/language_popup.js"
import { onlinePlayersPopup } from "../content/players.js"
import { opponentsPopup } from "../content/pong/opponents_popup.js"
import { optionsPopup } from "../content/pong/options_popup.js"
import { registerPopup } from "../content/register_popup.js"
import { blockedUsersPopup } from "../content/settings/blocked_users_popup.js"
import { changeAvatarPopup } from "../content/settings/change_avatar_popup.js"
import { changePasswordPopup } from "../content/settings/change_password_popup.js"
import { changeUsernamePopup } from "../content/settings/change_username_popup.js"
import { confidentialityPopup } from "../content/settings/confidentiality_popup.js"
import { deleteAccountPopup } from "../content/settings/delete_account_popup.js"
import { settingsPopup } from "../content/settings/settings_popup.js"

export type popupHandler = (app: App) => void

export type popupRoutes = {
	id: string
	handler: popupHandler
}

export const popups: popupRoutes[] = [
	{ id: "connect", handler: connectPopup },
	{ id: "register", handler: registerPopup },
	{ id: "language", handler: languagePopup },
	{ id: "settings", handler: settingsPopup },
	{ id: "confidentiality", handler: settingsPopup },
	{ id: "change-username", handler: changeUsernamePopup },
	{ id: "change-avatar", handler: changeAvatarPopup },
	{ id: "change-password", handler: changePasswordPopup },
	{ id: "confidentiality", handler: confidentialityPopup },
	{ id: "blocked-users", handler: blockedUsersPopup },
	{ id: "delete-account", handler: deleteAccountPopup },
	{ id: "options", handler: optionsPopup },
	{ id: "opponents", handler: opponentsPopup },
	{ id: "online-players", handler: onlinePlayersPopup },
]
