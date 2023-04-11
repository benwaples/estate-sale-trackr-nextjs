// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import User from '../../../models/User';
import { profileAsToken } from './utils';

type Data = {
	message?: string;
	token?: string;
}

export default async function signIn(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'POST') return;

	try {
		const {
			username,
			password
		} = req.body

		if (!username || !password) {
			return res.status(400).send({ message: 'missing username or password' })
		}

		const user = await User.signIn(username, password)
		console.log(`${username} has signed in`)

		return res.send(profileAsToken(user))
	} catch (e: any) {
		console.error(signIn.name, e.message)
		res.status(500).send(e.message)
	}
}
