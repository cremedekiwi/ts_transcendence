import { App } from "./App.js"

export type ContentType = string | HTMLElement

export default class Content {
	public root: HTMLElement = document.createElement("main")

	constructor(private app: App) {
		// Create the main content element
		this.root = document.createElement("main")
		this.root.id = "content-root"
		this.root.className = `flex items-center justify-center`
		this.root.innerHTML = "Default content"
	}

	render() {
		// this.root.style.height = `${window.innerHeight - this.app.navbar.root.clientHeight - 1}px`
		this.root.style.height = `calc(100vh - ${this.app.navbar.root.clientHeight + 1}px)`
		// Append the main content element to the body
		document.body.appendChild(this.root)
	}

	// Change the content of the main element
	// This function can take a string or an HTMLElement as an argument
	setContent(content: ContentType) {
		if (this.root) {
			if (typeof content === "string") {
				this.root.innerHTML = content
			} else if (content instanceof HTMLElement) {
				this.root.innerHTML = ""
				this.root.appendChild(content)
			}
		}
	}

	loader() {
		this.root.innerHTML = /* HTML */ `
			<div class="flex h-full w-full items-center justify-center">
				<div class="border-t-berry h-10 w-10 animate-spin rounded-full border-4 border-t-4 border-white"></div>
			</div>
		`
	}
}
