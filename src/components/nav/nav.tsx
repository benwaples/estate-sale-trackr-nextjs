import React from 'react';
import { useSession, signIn, signOut } from "next-auth/react";

function Nav() {
	const { data: session } = useSession();

	function authAction() {
		return session ? signOut() : signIn();
	}

	return (
		<nav>
			<button onClick={authAction}>
				{session ? 'Sign Out' : 'Sign In'}
			</button>
		</nav>
	);
}

export default Nav;
