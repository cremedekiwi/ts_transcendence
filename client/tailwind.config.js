module.exports = {
	content: ["./src/**/*.{html,js,ts,tsx}", "./public/index.html"],
	theme: {
		extend: {
			colors: {
				eerie: "#230926",
				purple: "#500A59",
				violet: "#940AA6",
				berry: "#C10BD9",
				green: "#61C24D",
				red: "#F92929",
			},
			fontFamily: {
				anonymous: ['"Anonymous Pro"', "monospace"],
				ancizar: ['"Ancizar Sans"', "sans-serif"],
			},
		},
	},
	plugins: [],
}
