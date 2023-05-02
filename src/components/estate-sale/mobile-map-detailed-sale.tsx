/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState, useCallback, useRef, TouchEventHandler } from 'react';
import cn from 'classnames';
import { MobileMapSaleViewType, SaleDetailsWithCoordinates } from '@/types';
import TabHeader from '../tab-header/tab-header';
import { getAddressContent, getDatesContent } from './detailed-sale-card';
import Slider, { Settings } from 'react-slick';
import NoImage from '../empty-state/no-image';
import FollowSale from '../follow-sale/follow-sale';
import useScreenQuery from '@/hooks/use-screen-query';
import styles from '../../styles/map.module.scss';

interface Props {
	sale: SaleDetailsWithCoordinates | null;
	view: { type: MobileMapSaleViewType, handleViewChange: React.Dispatch<React.SetStateAction<MobileMapSaleViewType>> };
}

const defaultTouchPosition = 0;

function MobileMapDetailedSale(props: Props) {
	const { sale, view } = props;

	const tabs = Object.keys(sale ?? {}).filter(key => !['id', 'images'].includes(key)).reverse();
	const hasImages = !!sale?.images?.length;
	const initialTab = !!sale?.["sale details"] ? "sale details" : tabs[0];

	const [content, setContent] = useState<string | JSX.Element>(sale?.[initialTab ?? tabs[0]]);
	const [currentImageIndex, setCurrentImageIndex] = useState(1);
	const [, setTouchYPosition] = useState(defaultTouchPosition);

	// sets initial content
	useEffect(() => {
		setContent(sale?.[initialTab ?? tabs[0]]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialTab, sale]);

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
			setContent(getAddressContent(sale?.address, sale?.coordinates) ?? '');
			return;
		}
		setContent(<p>{sale?.[tab]}</p>);
	};
	const handleTouchEnd = (startY: number, endY: number) => {
		// if start never triggered or if the swipe wasnt bigger than 50 px, do nothing
		if (!startY || Math.abs(startY - endY) <= 50) {
			return;
		};

		const didSwipeUp = endY < startY;
		const didSwipeDown = endY > startY;

		if (didSwipeUp && view.type === MobileMapSaleViewType.minimized) {
			view.handleViewChange(MobileMapSaleViewType.full);
		};

		if (didSwipeDown && view.type === MobileMapSaleViewType.full) {
			view.handleViewChange(MobileMapSaleViewType.minimized);
		};

		if (didSwipeDown && view.type === MobileMapSaleViewType.minimized) {
			view.handleViewChange(MobileMapSaleViewType.hidden);
		}
	};

	const handleTouchChange: (key: 'startY' | 'endY') => TouchEventHandler = (key: string) => (e) => {
		setTouchYPosition(prev => {
			if (key === 'endY') {
				handleTouchEnd(prev, e.changedTouches[0].screenY);

				return defaultTouchPosition;
			}

			return e.changedTouches[0].screenY;
		});
	};


	const sliderConfig: Settings = useMemo(() => ({
		className: styles.saleImages,
		lazyLoad: 'anticipated',
		afterChange(index: number) { setCurrentImageIndex(index + 1); },
		arrows: false,
	}), []);

	const memoizedSlider = useMemo(() => {
		return (
			<Slider {...sliderConfig}>
				{sale?.images?.map(img => <img key={img} className={cn(styles.saleImage, styles[view.type])} src={img} alt="" />)}
			</Slider>
		);
	}, [sale?.images, sliderConfig, view.type]);

	// loading card
	if (!sale) return <></>;

	// minimized/full view
	const isFullView = view.type === MobileMapSaleViewType.full;

	const handleViewChange = () => {
		view.handleViewChange(MobileMapSaleViewType[!isFullView ? 'full' : 'minimized']);
	};

	const viewToggle = (
		<button className={cn(styles.viewToggle, { [styles.up]: !isFullView, [styles.down]: isFullView })} onClick={handleViewChange}>&#62;</button>
	);

	return (
		<div className={cn(styles.mapSaleCard, styles[view.type])} key={sale?.id} onTouchStart={handleTouchChange('startY')} onTouchEnd={handleTouchChange('endY')} >
			<div className={styles.minimizedHeader}>
				{isFullView ? (
					<TabHeader tabs={tabs} initTab={initialTab} onClick={handleTabChange} />
				) : (
					<h3>{sale?.address}</h3>
				)}
				{viewToggle}
			</div>

			{(content && isFullView) ? (
				<div className={styles.content} key={sale?.id} onTouchMove={() => setTouchYPosition(defaultTouchPosition)} >{content}</div>
			) : null}

			<div className={styles.imageSliderWrapper}>
				{hasImages ? (
					<>
						{memoizedSlider}
						{isFullView ? (
							<p className={styles.sliderPagination}>{`${currentImageIndex}/${sale.images?.length}`}</p>
						) : null}
					</>
				) : <NoImage description='Images have not been posted for this sale' />}
			</div>

			{(sale && isFullView) ? <FollowSale {...sale} sale_id={sale.id} /> : null}
		</div>
	);
}

export default MobileMapDetailedSale;
