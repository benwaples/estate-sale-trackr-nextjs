import { Request } from 'express'
import { NextApiRequest, NextApiResponse } from 'next'
import User from './models/User'
export interface Dictionary {
	[key: string | number]: any
}


export type NextApiReq<T = {}> = Omit<NextApiRequest, 'body'> & { body: T } & { user: User };
export type NextApiRes<T = {}> = NextApiResponse & T