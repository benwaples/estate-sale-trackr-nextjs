import Sale from "@/models/FollowedSale";
import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

interface Session extends Omit<DefaultSession, 'user'> {
	user: DefaultSession["user"] & { followed_sales: number[] | null }
}

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
			const email = session.user?.email;

			let followed_sales = [];
			if (email) {
				followed_sales = await Sale.getAllFollowedSales(email);
			}

			return { ...session, user: { ...session.user, followed_sales } };
		}
	}
};
export default NextAuth(authOptions);