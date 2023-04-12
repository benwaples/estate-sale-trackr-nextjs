import React, { useEffect, useRef, useState } from 'react'
import Slider, { Settings } from 'react-slick';
import { Sale } from '@/types'
import TabHeader from '../tab-header/tab-header';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from '../../styles/estate-sale-list.module.scss'
import NoImage from '../empty-state/no-image';

interface Props {
	sale: Sale;
	beforeChange?: () => void;
	afterChange?: () => void;
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
						<li key={day}>{day}</li>
					)
				})}

			</ul>
		</div>
	)
}

function SaleCard(props: Props) {
	const { sale, beforeChange, afterChange } = props

	const tabs = Object.keys(sale).filter(key => !['id', 'images'].includes(key))
	const [content, setContent] = useState(sale["Sale Details"] ?? sale[tabs[0]])
	const [currentImageIndex, setCurrentImageIndex] = useState(1)

	const handleTabChange = (tab: string) => {
		if (tab === 'Dates') {
			setContent(getDatesContent(sale.Dates))
			return;
		}
		setContent(sale[tab])
	}

	const sliderConfig: Settings = {
		className: styles.saleImages,
		lazyLoad: 'anticipated',
		afterChange(index: number) { setCurrentImageIndex(index + 1) }
		// TODO: custom arrows
	}

	return (
		<div className={styles.saleCard}>
			<TabHeader tabs={tabs} onClick={handleTabChange} />
			<div className={styles.content}>{content}</div>
			{sale.images?.length ? (
				<>
					<div className={styles.imageSliderWrapper} onMouseEnter={beforeChange} onMouseLeave={afterChange}>
						<Slider {...sliderConfig}>
							{sale.images.map(img => <img key={img} className={styles.saleImage} src={img} />)}
						</Slider>
					</div>
					<p className={styles.sliderPagination}>{`${currentImageIndex}/${sale.images?.length}`}</p>
				</>
			) : <NoImage description='Images have not been posted for this sale' /> // TODO: if no images, put some sort of place holder here
			}
		</div>
	)
}

export default SaleCard
