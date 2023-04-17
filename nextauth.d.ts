import "next-auth";
import { DefaultSession } from 'next-auth'

declare module "next-auth" {

	interface Session extends DefaultSession {
		user: DefaultSession["user"] & { followed_sales: number[] | null }
	}
}