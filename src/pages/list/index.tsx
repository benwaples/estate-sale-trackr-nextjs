import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Router, { useRouter } from 'next/router';
import Slider, { Settings } from 'react-slick';
import cn from 'classnames';
import { BaseSaleData, SaleDetails } from '@/types';
import DetailedSaleCard from '../../components/estate-sale/detailed-sale-card';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from '../../styles/estate-sale-list.module.scss';
import ThumbnailSaleCard from '../../components/estate-sale/thumbnail-sale-card';
import useScreenQuery from '@/hooks/use-screen-query';
import { getHelper, toMap } from '@/utils/utils';
import DisplayToggle from '../../components/display-toggle/display-toggle';
import { allUpcomingSaleIds } from '../api/estate-sale/all-upcoming-sales';

export const getServerSideProps = async () => {
	const saleInfo = await allUpcomingSaleIds(true);
	return { props: { saleInfo } }; // will be passed to the page component as props
};

interface Props {
	saleInfo: BaseSaleData[];
}

function EstateSaleList(props: Props) {
	const { saleInfo } = props;
	const [canSwipe, setCanSwipe] = useState(true);
	const [currentSlide, setCurrentSlide] = useState(0);
	const [detailedSaleMap, setDetailedSaleMap] = useState<{ [key: SaleDetails["id"]]: SaleDetails } | null>(null);
	const [initialDetailedSlide, setInitialDetailedSlide] = useState<number>(0);
	const [loadingSale, setLoadingSale] = useState(true);
	const [swiping, setSwiping] = useState(false);

	const detailedSliderRef = useRef<Slider | null>(null);
	const thumbnailSliderRef = useRef<Slider | null>(null);

	const { isMobile } = useScreenQuery();
	const { query } = useRouter();

	const getSaleIds = useCallback(() => {
		if (!saleInfo) return;

		let saleIds = null;

		if (query.sale_id && !detailedSaleMap && thumbnailSliderRef.current) {
			const saleIndex = saleInfo.findIndex(sale => sale.id.toString() === query.sale_id);
			if (saleIndex !== -1) {
				setCurrentSlide(saleIndex);
				// scroll to slide in thumbnail slider
				thumbnailSliderRef.current.slickGoTo(saleIndex);
				setInitialDetailedSlide(saleIndex);
				// use current slide to get lookahead slides
				saleIds = saleInfo.slice(saleIndex, saleIndex + 3).map(({ id }) => id);
			}
		}

		if (currentSlide === 0 && !detailedSaleMap) {
			saleIds = saleInfo.slice(0, 5).map(({ id }) => id);
		}

		// is current slide null? then get that + 1 prev and 1 ahead
		if (!saleIds && !detailedSaleMap?.[saleInfo[currentSlide]?.id]) {
			saleIds = saleInfo.slice(currentSlide - 1, currentSlide + 1).map(({ id }) => id);
		}

		// look ahead
		const lookahead = currentSlide + 2;
		if (!saleIds && !detailedSaleMap?.[saleInfo[lookahead]?.id]) {
			saleIds = saleInfo.slice(lookahead, lookahead + 3).map(({ id }) => id);
		}

		return saleIds;
	}, [currentSlide, detailedSaleMap, query.sale_id, saleInfo]);

	useEffect(() => {
		const getSaleDetails = async (saleIds: number[]) => {
			setLoadingSale(true);
			const saleDetails = await getHelper(`/api/estate-sale/sale-details${saleIds.map(id => '/' + id).join('')}`);
			const saleMap = toMap(saleDetails, 'id');
			setLoadingSale(false);

			setDetailedSaleMap(prev => ({ ...prev, ...saleMap }));
		};

		const saleIds = getSaleIds();
		if (!saleIds?.length) return;

		getSaleDetails(saleIds);

	}, [currentSlide, getSaleIds, saleInfo]);

	const handleSlideChange = (i: number) => {
		setCurrentSlide(i);

		const slideId = saleInfo[i].id;
		Router.push(
			{
				pathname: '',
				query: { ...query, sale_id: slideId }
			},
			undefined, // AS param is not needed here
			{ shallow: true }
		);
	};

	const thumbnailSliderConfig: Settings = {
		className: cn(styles.thumbnailSlider),
		slidesToShow: isMobile ? 5 : 10,
		swipe: canSwipe,
		asNavFor: detailedSliderRef.current ?? undefined,
		vertical: true,
		swipeToSlide: true,
		verticalSwiping: true,
		focusOnSelect: true,
		arrows: false,
		afterChange: handleSlideChange,
		initialSlide: initialDetailedSlide >= 0 ? initialDetailedSlide : undefined
	};

	const detailedSliderConfig: Settings = {
		className: styles.detailedSliderWrapper,
		swipe: canSwipe,
		touchThreshold: canSwipe ? 100 : 1,
		vertical: true,
		arrows: false,
		swipeToSlide: true,
		verticalSwiping: true,
		asNavFor: thumbnailSliderRef.current ?? undefined,
		afterChange: handleSlideChange,
		initialSlide: initialDetailedSlide >= 0 ? initialDetailedSlide : undefined
	};

	return (
		<div className={styles.estateSaleList} >

			<div className={styles.thumbnailSliderWrapper}>
				<DisplayToggle />
				<h3 className={styles.thumbnailSliderTitle}>Upcoming Sales</h3>
				<Slider {...thumbnailSliderConfig} ref={ref => thumbnailSliderRef.current = ref}>
					{saleInfo?.map((sale, i) => <ThumbnailSaleCard key={sale.id} sale={sale} isActive={i === currentSlide} />)}
				</Slider>
				<div className={styles.prevNextContainer}>
					<button onClick={() => thumbnailSliderRef.current?.slickPrev()}>Prev</button>
					<button onClick={() => thumbnailSliderRef.current?.slickNext()}>Next</button>
				</div>
			</div>
			{/* still need this for mobile */}
			{detailedSaleMap ? (
				<Slider {...detailedSliderConfig} ref={ref => detailedSliderRef.current = ref}>
					{saleInfo.map(sale => {
						return (
							<DetailedSaleCard key={sale.id} saleId={sale.id} sale={detailedSaleMap[sale.id]} onMouseEnter={() => setCanSwipe(false)} onMouseLeave={() => setCanSwipe(true)} />
						);
					})}
				</Slider>
			) : "Loading..."}
		</div>
	);
}

export default EstateSaleList;
