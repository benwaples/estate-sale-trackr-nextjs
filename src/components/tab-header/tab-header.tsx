import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import styles from '../../styles/tab-header.module.scss';

interface Props {
	tabs: string[];
	onClick: (tab: string) => void;
	initTab?: string;
	loading?: boolean;
}

function TabHeader(props: Props) {
	const { tabs, onClick, initTab, loading } = props;

	const [activeTab, setActiveTab] = useState(initTab ?? tabs[0]);

	useEffect(() => { initTab && setActiveTab(initTab); }, [initTab]);

	const generateTabButton = (tab: string) => {
		const isActive = activeTab === tab;
		const handleClick = () => {
			setActiveTab(tab);
			onClick(tab);
		};
		return (
			<li key={tab} className={cn(styles.tabHeaderButton, { [styles.activeTab]: isActive })} onClick={handleClick}>{tab}</li>
		);
	};

	return (
		<div className={styles.tabHeader}>
			{loading ? (
				<ul>
					{Array(4).fill('').map((_, i) => <li key={i} className={cn(styles.tabHeaderButton, styles.skeleton)} />)}
				</ul>
			) : (
				<ul>{tabs.map(generateTabButton)}</ul>
			)}
		</div>
	);
}

export default TabHeader;
