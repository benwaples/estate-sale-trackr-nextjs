import React, { useEffect, useRef, useState } from 'react'
import Slider, { Settings } from 'react-slick';
import { Sale } from '@/types'
import TabHeader from '../tab-header/tab-header';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from '../../styles/estate-sale-list.module.scss'
import NoImage from '../empty-state/no-image';
import useScreenQuery from '@/hooks/use-screen-query';

interface Props {
	saleId: number;
	sale: Sale | undefined;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
}

function getDatesContent(dates: Sale["Dates"] | undefined) {
	if (!dates) return;
	// TODO: include a calendar view
	if (typeof dates === 'string') {
		return dates
	}
	return (
		<div className='dates'>
			<ul>
				<li>Start: {new Date(dates.startTime).toLocaleString()}</li>
				<li>End: {new Date(dates.endTime).toLocaleString()}</li>
				<br />
				{dates.dayAndTime.map(day => {
					return (
						<li key={day}>{day}</li>
					)
				})}

			</ul>
		</div>
	)
}

function DetailedSaleCard(props: Props) {
	const { isMobile, isDesktop } = useScreenQuery();
	const { saleId, sale, onMouseEnter, onMouseLeave } = props;

	const tabs = Object.keys(sale ?? {}).filter(key => !['id', !isMobile && 'Images'].includes(key)).reverse()
	const hasImages = !!sale?.Images?.length;
	const initialDesktopTab = !!sale?.["Sale Details"] ? "Sale Details" : tabs[0]
	const initialMobileTab = (hasImages && isMobile) ? 'Images' : undefined
	const initialTab = tabs.includes('Images') ? initialMobileTab : initialDesktopTab;

	const [content, setContent] = useState<string | JSX.Element>(initialMobileTab ? '' : sale?.[initialDesktopTab ?? tabs[0]])
	const [currentImageIndex, setCurrentImageIndex] = useState(1);

	// sets initial content
	useEffect(() => {
		if (isMobile && hasImages) {
			setContent('')
			return;
		};
		setContent(initialMobileTab ? '' : sale?.[initialDesktopTab ?? tabs[0]])
	}, [initialTab])

	const handleTabChange = (tab: string) => {
		if (tab === 'Dates') {
			setContent(getDatesContent(sale?.Dates) ?? '')
			return;
		}
		if (tab === 'Images') {
			setContent('')
			return;
		}
		setContent(<p>{sale?.[tab]}</p>)
	}

	const sliderConfig: Settings = {
		className: styles.saleImages,
		lazyLoad: 'anticipated',
		afterChange(index: number) { setCurrentImageIndex(index + 1) },
		arrows: false,
	}

	// fix the page while touching a card
	return (
		<div className={styles.saleCard} key={saleId}>
			<TabHeader tabs={tabs} initTab={initialTab} onClick={handleTabChange} />
			{content ? (
				<div className={styles.content} key={saleId}>{content}</div>
			) : null}
			{(isMobile && !content) || isDesktop ? (
				hasImages ? (
					<>
						<div className={styles.imageSliderWrapper} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
							<Slider {...sliderConfig}>
								{sale.Images.map(img => <img key={img} className={styles.saleImage} src={img} />)}
							</Slider>
						</div>
						<p className={styles.sliderPagination}>{`${currentImageIndex}/${sale.Images?.length}`}</p>
					</>
				) : <NoImage description='Images have not been posted for this sale' />
			) : null}
			<button className={styles.followSale}>Follow Sale</button>
		</div>
	)
}

export default DetailedSaleCard
