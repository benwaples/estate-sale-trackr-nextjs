import { Dictionary } from "@/types";

export function toMap(array: Dictionary[], key: string) {
	if (!array) return {};
	return array.reduce((a, c) => {
		a[c[key]] = c;
		return a;
	}, {});
}

export async function getHelper<T = any>(endpoint: string, headers?: Dictionary): Promise<T | undefined> {
	try {
		const response = await fetch(endpoint, { headers });
		const body: T = await response.json();

		return body;
	} catch (e) {
		console.error(e);
	}
}

export async function postHelper(endpoint: string, data?: Dictionary) {
	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data)
		});

		const body = await response.json();

		return body;
	} catch (e) {
		console.error(e);
	}
}