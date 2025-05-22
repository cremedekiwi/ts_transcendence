export function log(...args: any[]) {
	console.log(`[${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}]`, ...args)
}

export function error(...args: any[]) {
	console.error(`[${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}]`, ...args)
}
