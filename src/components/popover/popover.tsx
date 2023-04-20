import React from 'react';
import cn from 'classnames';
import styles from '../../styles/popover.module.scss';
import classNames from 'classnames';

interface Props {
	open: boolean;
	onClose: () => void;
	children?: JSX.Element;
	className?: string;
	size?: 'big' | 'medium' | 'small'
}

function Popover(props: Props) {
	const { open, onClose, children, className, size = 'medium' } = props;

	if (!open) return null;
	return (
		<div className={cn(styles.popover, className)}>
			<div className={cn(styles.popoverContent, styles[size])}>
				{children}
			</div>
		</div>
	);
}

export default Popover;
