export type TabHandler<T> = (tabName: T, contentElement: HTMLElement) => void

/**
 * Attaches a tab switching event listener to a container.
 * Updates the content of a target container dynamically without reloading.
 * Also toggles the active tab styling.
 *
 * @param containerSelector - The selector for the tab container.
 * @param contentSelector - The selector for the content container to update.
 * @param onTabSwitch - A callback function to handle tab switching.
 */
export function attachTabEventListener<T extends string>(containerSelector: string, contentSelector: string, onTabSwitch: TabHandler<T>) {
	const tabContainer = document.querySelector(containerSelector) as HTMLElement
	const contentElement = document.querySelector(contentSelector) as HTMLElement

	if (tabContainer && contentElement) {
		tabContainer.addEventListener("click", (event) => {
			const target = event.target as HTMLElement
			const tabName = target.getAttribute("data-tab-item") as T
			if (tabName) {
				// Call the provided callback function with the content element
				onTabSwitch(tabName, contentElement)

				// Toggle active tab styling
				tabContainer.querySelectorAll("[data-tab-item]")?.forEach((tab) => tab.classList.remove("active-tab"))
				tabContainer.querySelector(`[data-tab-item="${tabName}"]`)?.classList.add("active-tab")
			}
		})
	}
}

export const tabItem = (name: string, label: string, active: boolean, classList: string = ""): string => {
	return /* HTML */ ` <button data-tab-item="${name}" class="${active ? "active-tab" : ""} ${classList} px-4 py-2">${label}</button> `
}
