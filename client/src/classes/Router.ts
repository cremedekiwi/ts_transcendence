import { connectPopup } from "../content/connect_popup.js"
import { authorizationType, routeParams, routes, routeType, viewRenderer } from "../types/routes.js"
import { App } from "./App.js"

export class Router {
	private routes: routeType[] = []
	public currentPath: string = window.location.pathname
	public previousPath: string = "/"

	constructor(private app: App) {
		// Event listeners for navigation
		this.setupLinkInterception()
		this.setupBackForwardArrows()

		// Register default routes
		routes.forEach((route) => {
			this.register(route.path, route.title, route.renderer, route.authorization)
		})
	}

	register(path: string, title: string, renderer: viewRenderer, authorization: authorizationType = "everyone") {
		this.routes.push({ path, title, renderer, authorization })
	}

	navigate(path: string) {
		history.pushState(null, "", path)
		this.render()
	}

	render() {
		// Update the previous path only if the current path is different and not in the ignored paths
		// This prevents some misredirections
		const pathsToIgnore = ["/connect", "/logout", "/register", "/language"]
		if (this.currentPath !== window.location.pathname && !pathsToIgnore.includes(this.currentPath)) {
			this.previousPath = this.currentPath
		}
		this.currentPath = window.location.pathname

		for (const route of this.routes) {
			const match = this.matchRoute(route.path, this.currentPath)
			if (!match) continue

			if (route.authorization == "loggedIn" && this.app.isLoggedIn() == false) {
				this.renderPreviousPage()
				connectPopup(this.app)
			} else if (route.authorization == "loggedOut" && this.app.isLoggedIn() == true) {
				this.renderPreviousPage()
			} else {
				this.app.popup.close()
				this.app.content.loader()
				route.renderer(this.app, match.params)
				this.app.navbar.updateNavbarActiveLink(route.path)
				document.title = "KingPong | " + route.title
			}
			return
		}

		this.notFound()
		document.title = "KingPong | Page not found"
	}

	// Matches a path like "/chat/:id" with "/chat/123"
	// Returns an object with the params extracted from the path
	// Handles optional parameters with ":?" prefix
	// Example: matchRoute("/chat/:id", "/chat/123") returns { params: { id: "123" } }
	// Example: matchRoute("/profil/:?id", "/profil/") returns { params: {} }
	private matchRoute(routePath: string, currentPath: string) {
		const routeParts = routePath.split("/").filter(Boolean)
		const pathParts = currentPath.split("/").filter(Boolean)

		if (pathParts.length > routeParts.length) return null

		const params: routeParams = {}

		for (let i = 0; i < routeParts.length; i++) {
			const routePart = routeParts[i]
			const pathPart = pathParts[i]

			if (routePart.startsWith(":")) {
				const isOptional = routePart.startsWith(":?")
				const paramName = isOptional ? routePart.slice(2) : routePart.slice(1)

				if (pathPart) {
					params[paramName] = pathPart
				} else if (!isOptional) {
					return null // Required parameter is missing
				}
			} else if (routePart !== pathPart) {
				return null // Static segment does not match
			}
		}

		return { params }
	}

	notFound() {
		this.app.changeContent(/* HTML */ `
			<div id="gameContainer" class="mb-14 flex h-[calc(100vh-57px)] w-full flex-col items-center justify-center">
				<img src="/assets/images/404.png" class="w-1/4" alt="Error 404" />
			</div>
		`)
	}

	renderPreviousPage() {
		this.navigate(this.previousPath)
	}

	renderCurrentPage() {
		this.navigate(this.currentPath)
	}

	setupLinkInterception() {
		document.addEventListener("click", (event) => {
			const target = event.target as HTMLElement
			if (target.matches("[data-link]")) {
				event.preventDefault()
				const href = target.getAttribute("href")
				if (href) {
					this.navigate(href)
				}
			}
		})
	}

	setupBackForwardArrows() {
		window.addEventListener("popstate", () => this.render())
	}
}
