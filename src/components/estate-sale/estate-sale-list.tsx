import { useEffect, useMemo, useRef, useState } from 'react';
import Slider, { Settings } from 'react-slick';
import cn from 'classnames'
import { BaseSaleData, Sale } from '@/types'
import DetailedSaleCard from './detailed-sale-card';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from '../../styles/estate-sale-list.module.scss'
import ThumbnailSaleCard from './thumbnail-sale-card';
import useScreenQuery from '@/hooks/use-screen-query';
import { getHelper, toMap } from '@/utils/utils';

interface Props {
	saleInfo: BaseSaleData[];
}

function EstateSaleList(props: Props) {
	const { saleInfo } = props
	const [canSwipe, setCanSwipe] = useState(true)
	const [currentSlide, setCurrentSlide] = useState(0)
	const [detailedSaleMap, setDetailedSaleMap] = useState<{ [key: Sale["id"]]: Sale } | null>(null)
	const [loadingSale, setLoadingSale] = useState(true)
	const [swiping, setSwiping] = useState(false)

	const detailedSliderRef = useRef<Slider | null>(null);
	const thumbnailSliderRef = useRef<Slider | null>(null);

	const { isMobile } = useScreenQuery();

	useEffect(() => {
		const getSaleDetails = async (saleIds: number[]) => {
			setLoadingSale(true)
			const saleDetails = await getHelper(`/api/estate-sale/sale-details${saleIds.map(id => '/' + id).join('')}`)
			const saleMap = toMap(saleDetails, 'id')
			setLoadingSale(false)

			setDetailedSaleMap(prev => ({ ...prev, ...saleMap }))
		};

		const getSaleIds = () => {
			let saleIds = null;
			if (currentSlide === 0 && !detailedSaleMap) {
				saleIds = saleInfo.slice(0, 5).map(({ id }) => id);
			}

			// is current slide null? then get that + 1 prev and 1 ahead
			if (!saleIds && !detailedSaleMap?.[saleInfo[currentSlide]?.id]) {
				saleIds = saleInfo.slice(currentSlide - 1, currentSlide + 1).map(({ id }) => id)
			}

			// look ahead
			const lookahead = currentSlide + 2
			if (!saleIds && !detailedSaleMap?.[saleInfo[lookahead]?.id]) {
				saleIds = saleInfo.slice(lookahead, lookahead + 3).map(({ id }) => id)
			}

			return saleIds;
		}

		const saleIds = getSaleIds()
		if (!saleIds) return;

		getSaleDetails(saleIds);
	}, [currentSlide])

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
		afterChange: setCurrentSlide,
	}

	const detailedSliderConfig: Settings = {
		className: styles.detailedSliderWrapper,
		swipe: canSwipe,
		touchThreshold: canSwipe ? 100 : 1,
		vertical: true,
		arrows: false,
		swipeToSlide: true,
		verticalSwiping: true,
		asNavFor: thumbnailSliderRef.current ?? undefined,
		afterChange: setCurrentSlide,
	}

	// TODO: add current sale to url and load that one if its present
	return (
		<div className={styles.estateSaleList} >

			<div className={styles.thumbnailSliderWrapper}>
				<h3 className={styles.thumbnailSliderTitle}>Upcoming Sales</h3>
				<Slider {...thumbnailSliderConfig} ref={ref => thumbnailSliderRef.current = ref}>
					{saleInfo.map((sale, i) => <ThumbnailSaleCard key={sale.id} sale={sale} isActive={i === currentSlide} />)}
				</Slider>
				<div className={styles.prevNextContainer}>
					<button onClick={() => thumbnailSliderRef.current?.slickPrev()}>Prev</button>
					<button onClick={() => thumbnailSliderRef.current?.slickNext()}>Next</button>
				</div>
			</div>
			{/* {(detailedSale && !loadingSale) ? (
				<DetailedSaleCard sale={detailedSale} onMouseEnter={() => setCanSwipe(false)} onMouseLeave={() => setCanSwipe(true)} />
				// placeholder while fetching
			) : 'Loading...'} */}
			{/* still need this for mobile */}
			{detailedSaleMap ? (
				<Slider {...detailedSliderConfig} ref={ref => detailedSliderRef.current = ref}>
					{saleInfo.map(sale => {
						return (
							<DetailedSaleCard key={sale.id} saleId={sale.id} sale={detailedSaleMap[sale.id]} onMouseEnter={() => setCanSwipe(false)} onMouseLeave={() => setCanSwipe(true)} />
						)
					})}
				</Slider>
			) : "Loading..."}
		</div>
	)
}

export default EstateSaleList
