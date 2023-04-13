import React, { useState } from 'react'
import cn from 'classnames'
import styles from '../../styles/tab-header.module.scss'

interface Props {
	tabs: string[];
	onClick: (tab: string) => void;
	initTab?: string;
}

function TabHeader(props: Props) {
	const { tabs, onClick, initTab } = props;

	const [activeTab, setActiveTab] = useState(initTab ?? tabs[0])

	const generateTabButton = (tab: string) => {
		const isActive = activeTab === tab;
		const handleClick = () => {
			setActiveTab(tab)
			onClick(tab);
		}
		return (
			<li className={cn(styles.tabHeaderButton, { [styles.activeTab]: isActive })} onClick={handleClick}>{tab}</li>
		)
	}

	return (
		<div className={styles.tabHeader}><ul>{tabs.map(generateTabButton)}</ul></div>
	)
}

export default TabHeader
