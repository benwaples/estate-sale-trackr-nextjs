import { NextFunction, Request, Response } from 'express';
import { verify, sign } from '../../../utils/jwt';
import User from '../model/User';
import { ExpressRequest } from '../types';

function profileAsToken(user: User) {
	// eslint-disable-next-line no-unused-vars
	const { password, ...rest } = user;
	return {
		token: sign(rest)
	};
}

export function checkAuth(req: Request, res: Response, next: NextFunction) {
	const token = req.get('Authorization');
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
	next();
};

export async function signUp(req: ExpressRequest<{ username: string, password: string }>, res: Response) {
	try {
		const {
			username,
			password
		} = req.body

		if (!username || !password) {
			return res.status(400).json({ message: 'missing username or password' })
		}

		const user = await User.signUp(username, password)

		return res.send(profileAsToken(user))
	} catch (e: any) {
		console.error(signUp.name, e.message)
		res.status(500).send(e.message)
	}
}

export async function signIn(req: Request, res: Response) {

	try {
		const {
			username,
			password
		} = req.body

		if (!username || !password) {
			return res.status(400).send({ message: 'missing username or password' })
		}

		const user = await User.signIn(username, password)

		return res.send(profileAsToken(user))
	} catch (e: any) {
		console.error(signUp.name, e.message)
		res.status(500).send(e.message)
	}
}
