function input(
	type: string,
	name: string,
	label: string,
	attributes: string = "",
	classList: string = "w-full border-2 border-violet/50 hover:border-violet px-4 py-2 h-[42px] focus:outline-none focus:ring-2 focus:ring-berry rounded-lg text-eerie bg-white/95 shadow-sm transition-all duration-200",
): string {
	return /* HTML */ `
		<div class="flex flex-col">
			<input
				type="${type}"
				id="${name}-input"
				name="${name}"
				${attributes}
				class="${classList}"
				${type === "reset" ? `value="${label}"` : `placeholder="${label}"`}
			/>
		</div>
	`
}

export function textInput(name: string, label: string, attributes: string = ""): string {
	return input("text", name, label, attributes)
}

export function passwordInput(name: string, label: string, attributes: string = ""): string {
	return input("password", name, label, attributes)
}

export function resetInput(name: string, label: string, attributes: string = ""): string {
	return input(
		"reset",
		name,
		label,
		attributes,
		"bg-gradient-to-r from-violet to-berry hover:opacity-90 active:opacity-100 active:scale-[0.99] h-[42px] w-full border-none text-base font-semibold text-white rounded-lg shadow-md transition-all duration-200",
	)
}

export function errorDiv(): string {
	return /* HTML */ ` <div class="text-red absolute -top-10 left-0 hidden w-full px-2 text-center text-sm" data-error>This is an error</div> `
}
