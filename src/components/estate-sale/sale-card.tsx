import React, { useState } from 'react'
import Slider, { Settings } from 'react-slick';
import { Sale } from '@/types'
import TabHeader from '../tab-header/tab-header';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from '../../styles/estate-sale-list.module.scss'

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

	const sliderConfig: Settings = {
		className: 'saleImages'
	}

	return (
		<div className={styles.saleCard}>
			<TabHeader tabs={tabs} onClick={handleTabChange} />
			<div className="content">{content}</div>
			{sale.images?.length ? (
				<Slider {...sliderConfig}>
					{sale.images.map(img => <img src={img} />)}
				</Slider>
			)
				: null}
		</div>
	)
}

export default SaleCard
