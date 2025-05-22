import { registerUser } from "../modules/auth/auth.service.js"
import { getUserByUsername } from "../modules/users/users.model.js"

export async function seedDatabase(db: any, clean: boolean = false) {
	// console.log("Seeding database")

	try {
		// Clear existing data (optional)
		if (clean) {
			db.exec(`
                DELETE FROM matches;
                DELETE FROM user_relationships;
                DELETE FROM users;
            `)
		}

		// Create dummy users
		const users = ["Nabil", "David", "Coco", "Kiwi", "Xavier", "Sophie"]

		const shuffled_users = users.sort(() => Math.random() - 0.5)

		const isAlreadySeeded = getUserByUsername(users[0]) ?? null
		// console.log(`isAlreadySeeded = `, isAlreadySeeded)
		if (isAlreadySeeded) {
			throw "Database is already seeded"
		}

		for (const username of shuffled_users) {
			await registerUser(username, "password")
		}

		// Generate random amout of matches between every pair of users
		// i = player1, j = player 2, gamesToPlay = number of games they will play
		const matches: string[] = []
		for (let i = 0; i < users.length; i++) {
			for (let j = i + 1; j < users.length; j++) {
				const player1 = users[i]
				const player2 = users[j]
				const gamesToPlay = Math.random() * 100

				for (let k = 0; k < gamesToPlay; k++) {
					// Play until someone reaches 3 points
					let score1 = 0
					let score2 = 0
					let duration = 0

					while (score1 < 3 && score2 < 3) {
						// Each point takes between 5-30 seconds
						const pointDuration = Math.floor(Math.random() * 26) + 5
						duration += pointDuration

						// Randomly decide who wins this point
						if (Math.random() < 0.5) {
							score1++
						} else {
							score2++
						}
					}

					const winner = score1 === 3 ? player1 : player2
					matches.push(`('${player1}', '${player2}', '${winner}', ${score1}, ${score2}, ${duration})`)
				}
			}
		}

		// Insert all matches into the database
		db.exec(`
			INSERT INTO matches (player1, player2, winner, score1, score2, duration) VALUES
			${matches.join(",\n")};
		`)

		// console.log("Dummy data inserted successfully!")
	} catch (error) {
		console.error("Error seeding database:", error)
	}
}
