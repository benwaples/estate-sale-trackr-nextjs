import { Dictionary } from "@/types";

export function toMap(array: Dictionary[], key: string) {
	if (!array) return {}
	return array.reduce((a, c) => {
		a[c[key]] = c
		return a
	}, {})
}

export async function getHelper(endpoint: string) {
	try {
		const response = await fetch(endpoint)
		const body = await response.json();

		return body
	} catch (e) {
		console.error(e)
	}
}