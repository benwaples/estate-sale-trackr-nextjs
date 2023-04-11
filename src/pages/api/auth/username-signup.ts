import { NextApiRequest, NextApiResponse } from "next";
import User from "../../../models/User";
import { profileAsToken } from "./utils";

type Data = {
	message?: string;
	token?: string;
}

export default async function signUp(
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
			return res.status(400).json({ message: 'missing username or password' })
		}

		const user = await User.signUp(username, password)
		console.log(`${username} has signed up`)

		return res.send(profileAsToken(user))
	} catch (e: any) {
		console.error(signUp.name, e.message)
		res.status(500).send(e.message)
	}
}