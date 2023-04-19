import { Request } from 'express'
import { NextApiRequest, NextApiResponse } from 'next'
import User from './models/User'
export interface Dictionary {
	[key: string | number]: any
}


export type NextApiReq<T = {}> = Omit<NextApiRequest, 'body'> & { body: T } & { user: User };
export type NextApiRes<T = {}> = NextApiResponse & T;

export interface BaseSaleData {
	id: number;
	address: string;
}

export interface SaleDetails extends Dictionary {
	id: number;
	dates?: {
		startTime: number;
		endTime: number;
		dayAndTime: string[]
	};
	images: string[]
}

export enum Status {
	inactive,
	active
}
export interface FollowedSale {
	id: number;
	status: Status;
	sale_id: number;
	follower_email: string;
	user_given_name: string | null;
	address: string;
	start_time?: number;
	end_time?: number;
	created_at: number;
}