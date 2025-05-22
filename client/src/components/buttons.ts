export function link(label: string, href: string = "#", pathname: string = href): string {
	return /* HTML */ `
		<a href="${href}" data-link="${pathname}" class="hover-effect mb-2 me-2 px-5 py-2.5 text-center text-xl font-normal"> ${label} </a>
	`
}

export function popupLink(id: string, label: string): string {
	return /* HTML */ ` <p data-popup="${id}" class="hover-effect text-center text-lg font-medium"> ${label} </a> `
}

// Main button of the app (berry color)
export function baseButton(label: string, attributes: string = "type='button'"): string {
	return customButton(label, "bg-gradient-to-r from-violet to-berry text-white rounded-lg", attributes)
}

// Button that holds styles we want to apply to all buttons
export function customButton(label: string, classList: string, attributes: string = "type='button'"): string {
	return /* HTML */ `
		<button
			${attributes}
			class="${classList} w-full transform px-5 py-2.5 text-center text-lg font-medium shadow-md transition-all duration-300 hover:translate-y-[-2px] hover:bg-opacity-90 hover:shadow-lg"
		>
			${label}
		</button>
	`
}

// customButton but without the translate effect
export function customButtonNoTranslate(label: string, classList: string, attributes: string = "type='button'"): string {
	return /* HTML */ `
		<button
			${attributes}
			class="${classList} w-full transform px-5 py-2.5 text-center text-lg font-medium shadow-md transition-all duration-300 hover:bg-opacity-90 hover:shadow-lg"
		>
			${label}
		</button>
	`
}

export function langButton(key: string, label: string) {
	return /* HTML */ ` <button class="bg-violet/30 hover:bg-berry w-full cursor-pointer py-2 text-center" data-lang="${key}">${label}</button> `
}
