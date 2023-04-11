import { Sale } from '@/types'
import React, { useState } from 'react'
import styles from '../../styles/estate-sale-list.module.scss'
import TabHeader from '../tab-header/tab-header';

interface Props {
	sale: Sale;
}

function getDatesContent(dates: Sale["Dates"]) {
	// TODO: make this a calendar view
	if (typeof dates === 'string') {
		return dates
	}
	return (
		<div className='dates'>
			<ul>
				<li>Start: {new Date(dates.startTime).toLocaleString()}</li>
				<li>End: {new Date(dates.endTime).toLocaleString()}</li>

				{dates.dayAndTime.map(day => {
					return (
						<li>{day}</li>
					)
				})}

			</ul>
		</div>
	)
}

function SaleCard(props: Props) {
	const { sale } = props
	const tabs = Object.keys(sale).filter(key => !['id', 'images'].includes(key))

	const [content, setContent] = useState(sale[tabs[0]])


	const handleTabChange = (tab: string) => {
		if (tab === 'Dates') {
			setContent(getDatesContent(sale.Dates))
			return;
		}
		setContent(sale[tab])
	}

	return (
		<div className={styles.saleCard}>
			<TabHeader tabs={tabs} onClick={handleTabChange} />
			<div className="content">{content}</div>
		</div>
	)
}

export default SaleCard
