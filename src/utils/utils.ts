import { Dictionary } from "@/types";

export function toMap(array: Dictionary[], key: string) {
	return array.reduce((a, c) => {
		a[c[key]] = c
		return a
	}, {})
}

export async function getHelper(endpoint: string) {
	try {
		console.log('endpoint', endpoint)
		const response = await fetch(endpoint)
		const body = await response.json();

		return body
	} catch (e) {
		console.error(e)
	}
}