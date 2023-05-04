import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import Slider, { Settings } from 'react-slick';
import { SaleDetails } from '@/types';
import TabHeader from '../tab-header/tab-header';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from '../../styles/estate-sale-list.module.scss';
import NoImage from '../empty-state/no-image';
import useScreenQuery from '@/hooks/use-screen-query';
import FollowSale from '../follow-sale/follow-sale';

interface Props {
	saleId?: number;
	sale: SaleDetails | null;
	host?: string;
	hostUrl?: string;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
}

export function getDatesContent(dates: SaleDetails["dates"] | undefined) {
	if (!dates) return;
	const dateOptions: Intl.DateTimeFormatOptions = {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		hour: 'numeric',
		minute: 'numeric',
		hour12: true
	};
	return (
		<div className='dates'>
			<ul>
				<li>Start: {new Date(dates.startTime).toLocaleString('en-US', dateOptions)}</li>
				<li>End: {new Date(dates.endTime).toLocaleString('en-US', dateOptions)}</li>
				<br />
				{dates.dayAndTime.map(day => {
					return (
						<li key={day}>{day}</li>
					);
				})}

			</ul>
		</div>
	);
}

export function getAddressContent(address: string | undefined) {
	if (!address) return;

	if (address.toLowerCase().includes('region')) {
		return address;
	}

	return (
		<a href={`https://www.google.com/maps/place/?q=${encodeURI(address)}`} target='_blank'>{address}</a>
	);
}

function DetailedSaleCard(props: Props) {
	const { isMobile, isDesktop } = useScreenQuery();
	const { saleId, sale, host, hostUrl, onMouseEnter, onMouseLeave } = props;

	const tabs = Object.keys(sale ?? {}).filter(key => !['id', 'coordinates', !isMobile && 'images'].includes(key)).reverse();
	const hasImages = !!sale?.images?.length;
	const initialDesktopTab = !!sale?.["sale details"] ? "sale details" : tabs[0];
	const initialMobileTab = (hasImages && isMobile) ? 'images' : undefined;
	const initialTab = tabs.includes('images') ? initialMobileTab : initialDesktopTab;

	const [content, setContent] = useState<string | JSX.Element>(initialMobileTab ? '' : sale?.[initialDesktopTab ?? tabs[0]]);
	const [currentImageIndex, setCurrentImageIndex] = useState(1);

	// sets initial content
	useEffect(() => {
		if (isMobile && hasImages) {
			setContent('');
			return;
		};
		setContent(initialMobileTab ? '' : sale?.[initialDesktopTab ?? tabs[0]]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialTab]);

	const handleTabChange = (tab: string) => {
		if (tab === 'dates') {
			setContent(getDatesContent(sale?.dates) ?? '');
			return;
		}
		if (tab === 'images') {
			setContent('');
			return;
		}
		if (tab === 'address') {
			setContent(getAddressContent(sale?.address) ?? '');
			return;
		}
		setContent(<p>{sale?.[tab]}</p>);
	};

	const sliderConfig: Settings = {
		className: styles.saleImages,
		lazyLoad: 'anticipated',
		afterChange(index: number) { setCurrentImageIndex(index + 1); },
		arrows: false,
	};

	// TODO: add drag handles
	return (
		<div className={styles.saleCard} key={saleId}>
			<TabHeader loading={!sale} tabs={tabs} initTab={initialTab} onClick={handleTabChange} />
			<div className={cn(styles.content, { [styles.skeleton]: !sale })} key={saleId} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onTouchStart={onMouseEnter} onTouchEnd={onMouseLeave}>{content}</div>
			{(isMobile && !content) || isDesktop ? (
				sale ? (
					hasImages ? (
						<>
							<div className={styles.imageSliderWrapper} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
								<Slider {...sliderConfig}>
									{sale.images.map(img => <img key={img} className={styles.saleImage} src={img} alt="" />)}
								</Slider>
							</div>
							<p className={styles.sliderPagination}>{`${currentImageIndex}/${sale.images?.length}`}</p>
						</>
					) : <NoImage description='Images have not been posted for this sale' />
				) : (
					<div className={styles.skeletonImage} />
				)
			) : <div className={styles.skeletonImage} />}
			<h6 className={cn(styles.host, { [styles.skeleton]: !sale })}>
				{hostUrl ? (
					<a href={hostUrl} target='_blank'>{host}</a>
				) : (
					host
				)
				}
			</h6>
			<FollowSale {...sale} sale_id={saleId} />
		</div>
	);
}

export default DetailedSaleCard;
