import { MapSaleViewTypes, SaleDetails } from '@/types';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import TabHeader from '../tab-header/tab-header';
import styles from '../../styles/map.module.scss';
import { getDatesContent } from './detailed-sale-card';
import Slider, { Settings } from 'react-slick';
import NoImage from '../empty-state/no-image';
import FollowSale from '../follow-sale/follow-sale';
import useScreenQuery from '@/hooks/use-screen-query';

interface Props {
	sale: SaleDetails | null;
	view: MapSaleViewTypes;
}

function MobileMapDetailedSale(props: Props) {
	const { sale, view } = props;

	const { isMobile, isDesktop } = useScreenQuery();

	const tabs = Object.keys(sale ?? {}).filter(key => !['id', !isMobile && 'images'].includes(key)).reverse();
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
		setContent(<p>{sale?.[tab]}</p>);
	};

	const sliderConfig: () => Settings = useCallback(() => ({
		className: styles.saleImages,
		lazyLoad: 'anticipated',
		afterChange(index: number) { setCurrentImageIndex(index + 1); },
		arrows: false,
	}), []);

	const memoizedSlider = useMemo(() => {
		return (
			<Slider {...sliderConfig}>
				{sale?.images.map(img => <img key={img} className={styles.saleImage} src={img} alt="" />)}
			</Slider>
		);
	}, [sale?.images, sliderConfig]);

	if (view === MapSaleViewTypes.none) return <></>;

	// loading card
	if (!sale) return <></>;

	// minimized view
	if (view === MapSaleViewTypes.minimized) {
		return (
			<div className={styles.minimizedCard}>
				<h3>{sale?.address ?? ''}</h3>
				<div className={styles.imageSliderWrapper}>
					{memoizedSlider}
				</div>
			</div>
		);
	};
	// full view
	return (
		<div className={styles.mapSaleCard} key={sale?.id}>
			<TabHeader tabs={tabs} initTab={initialTab} onClick={handleTabChange} />
			{content ? (
				<div className={styles.content} key={sale?.id} >{content}</div>
			) : null}
			{(isMobile && !content) || isDesktop ? (
				hasImages ? (
					<>
						<div className={styles.imageSliderWrapper}>
							{memoizedSlider}
						</div>
						<p className={styles.sliderPagination}>{`${currentImageIndex}/${sale.images?.length}`}</p>
					</>
				) : <NoImage description='Images have not been posted for this sale' />
			) : null}
			{sale ? <FollowSale {...sale} sale_id={sale.id} /> : null}
		</div>
	);
}

export default MobileMapDetailedSale;
