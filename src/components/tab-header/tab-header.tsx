import React, { useState } from 'react'
import cn from 'classnames'
import styles from '../../styles/tab-header.module.scss'

interface Props {
	tabs: string[];
	onClick: (tab: string) => void;
}

function TabHeader(props: Props) {
	const { tabs, onClick } = props;

	const [activeTab, setActiveTab] = useState(tabs[0])

	const generateTabButton = (tab: string) => {
		const isActive = activeTab === tab;
		const handleClick = () => {
			setActiveTab(tab)
			onClick(tab);
		}
		return (
			<li className={cn('tabHeaderButton', isActive)} onClick={handleClick}>{tab}</li>
		)
	}

	return (
		<div className={styles.tabHeader}><ul>{tabs.map(generateTabButton)}</ul></div>
	)
}

export default TabHeader