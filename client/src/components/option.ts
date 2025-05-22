export function option(
	name: string,
	label: string,
	default_value: number,
	min: number,
	max: number,
	step: number = 1,
	disabled: boolean = true,
): string {
	return /* HTML */ `
		<div class="border-berry/60 flex w-full flex-col gap-2 border-b px-6 py-3 text-white">
			<div data-slider="${name}" class="flex flex-row items-center gap-2">
				<label for="${name}" class="pl-2 text-sm font-medium">${label}</label>
				<div class="w-4 text-right text-xs opacity-70">${min}</div>
				<div class="relative flex-1">
					<div class="bg-berry/30 absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full"></div>
					<input
						type="range"
						id="${name}_range"
						value="${default_value}"
						min=${min}
						max=${max}
						step=${step}
						${disabled ? "disabled" : "enabled"}
						class="relative z-10 h-5 w-full cursor-pointer appearance-none bg-transparent"
					/>
				</div>
				<div class="w-4 text-xs opacity-70">${max}</div>
				<input
					type="number"
					id="${name}_num"
					value="${default_value}"
					min=${min}
					max=${max}
					name="${name}"
					${disabled ? "disabled" : "enabled"}
					class="bg-berry/20 w-[6ch] rounded px-2 py-1 text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
				/>
			</div>
		</div>
	`
}
