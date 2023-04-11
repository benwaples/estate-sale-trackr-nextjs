import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
export const authOptions: NextAuthOptions = {
	session: {
		strategy: 'jwt'
	},
	// Configure one or more authentication providers
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID ?? '',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
		}),
		// ...add more providers here
	],
}
export default NextAuth(authOptions)