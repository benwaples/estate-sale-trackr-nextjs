import React from 'react';

interface Props {
	children?: JSX.Element;
	display: boolean;
}

function OptionalComponent(props: Props) {
	const {
		children,
		display,
	} = props;

	if (!display || !children) return null;
	return children;
}

export default OptionalComponent;
