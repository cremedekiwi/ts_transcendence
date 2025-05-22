export const googleOAuthConfig = {
	clientId: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackUri: "http://localhost:3000/auth/google/callback",
	scopes: ["profile", "email"],
}
