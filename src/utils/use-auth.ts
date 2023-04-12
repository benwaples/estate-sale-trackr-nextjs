import Router from 'next/router';
import useSWR from 'swr'

export async function fetcher<JSON = any>(
	input: RequestInfo,
	init?: RequestInit
): Promise<JSON> {
	const res = await fetch(input, init);
	return res.json();
}

function useAuth() {
	const { data, error, isLoading } = useSWR<{ token: string }, string>('/api/user/123', fetcher)
	const token = data?.token

	if (token) {
		localStorage.setItem('token', data.token)
	}

	if (!token ?? false) Router.push('/auth')

	return {
		token
	}
}

export default useAuth
