import { Request } from 'express';
import { NextApiRequest, NextApiResponse } from 'next';
import User from './models/User';
export interface Dictionary {
	[key: string | number]: any
}


export type NextApiReq<T = {}> = Omit<NextApiRequest, 'body'> & { body: T } & { user: User };
export type NextApiRes<T = {}> = NextApiResponse & T;

export interface BaseSaleData {
	id: number;
	address: string;
}

export interface CoordinateSaleData extends BaseSaleData {
	coordinates: { lat: number, lng: number }
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

export type SaleDetailsWithCoordinates = SaleDetails & CoordinateSaleData

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

export interface RadarMetaResponse {
	code: number
}

export interface RadarAddressResponse {
	latitude: number
	longitude: number
	geometry: RadarGeometryResponse
	country: string
	countryCode: string
	countryFlag: string
	county: string
	distance: number
	confidence: string
	city: string
	stateCode: string
	state: string
	layer: string
	formattedAddress: string
	addressLabel: string
}

export interface RadarGeometryResponse {
	type: string
	coordinates: number[]
}
export interface RadarGeocodeForwardResponse {
	meta: RadarMetaResponse
	addresses: RadarAddressResponse[]
}

export enum MobileMapSaleViewType {
	hidden = 'hidden',
	minimized = 'minimized',
	full = 'full',
}