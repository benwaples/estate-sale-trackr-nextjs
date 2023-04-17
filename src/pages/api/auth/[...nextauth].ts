import User from "@/models/User"
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
	callbacks: {
		session: async ({ session }) => {
			const email = session.user?.email

			let followed_sales: number[] = []
			if (email) {
				followed_sales = await User.getAllFollowedSales(email)
			}

			return {
				...session,
				user: {
					...session.user,
					followed_sales
				}
			}
		}
	}
}
export default NextAuth(authOptions)