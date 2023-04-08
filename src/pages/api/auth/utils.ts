import { NextApiRequest, NextApiResponse } from "next";
import User from "../model/User";
import jwt from 'jsonwebtoken';
import { NextApiReq } from "@/types";
const APP_SECRET = process.env.APP_SECRET || 'CHANGEMENOW';

export function sign(user: Omit<User, 'password'>) {
	return jwt.sign(user, APP_SECRET);
}

export function verify(token: string) {
	return jwt.verify(token, APP_SECRET) as User;
}

export function profileAsToken(user: User) {
	// eslint-disable-next-line no-unused-vars
	const { password, ...rest } = user;
	return {
		token: sign(rest)
	};
}

export function checkAuthMiddleware(route: (req: NextApiReq, res: NextApiResponse<{ error: string }>) => any) {
	return (req: NextApiReq, res: NextApiResponse) => {
		// middleware
		const token = req.headers.authorization
		if (!token) {
			res.status(401).json({ error: 'no authorization found' });
			return;
		}

		let payload = null;
		try {
			payload = verify(token);
		}
		catch (err) {
			// this code runs with verify fails
			res.status(401).json({ error: 'invalid token' });
			return;
		}

		req.user = payload;
		return route(req, res)
	}
}
