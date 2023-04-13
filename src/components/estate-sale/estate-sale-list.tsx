import { useRef, useState } from 'react';
import Slider, { Settings } from 'react-slick';
import cn from 'classnames'
import { Sale } from '@/types'
import DetailedSaleCard from './detailed-sale-card';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from '../../styles/estate-sale-list.module.scss'
import ThumbnailSaleCard from './thumbnail-sale-card';
import useScreenQuery from '@/hooks/use-screen-query';

interface IArrowProps {
	direction: "up" | "down" | "right" | "left";
	onClick?: () => void;
	className?: string;
}
interface Props {
	saleInfo: Sale[];
}

function EstateSaleList(props: Props) {
	const { saleInfo } = props
	const [canSwipe, setCanSwipe] = useState(true)
	const [currentSlide, setCurrentSlide] = useState(0)

	const detailedSliderRef = useRef<Slider | null>(null);
	const thumbnailSliderRef = useRef<Slider | null>(null);

	const { isDesktop } = useScreenQuery();

	const thumbnailSliderConfig: Settings = {
		className: styles.thumbnailSlider,
		slidesToShow: 10,
		swipe: canSwipe,
		asNavFor: detailedSliderRef.current ?? undefined,
		vertical: true,
		swipeToSlide: true,
		verticalSwiping: true,
		focusOnSelect: true,
		arrows: false,
		afterChange(i: number) { setCurrentSlide(i) },
	}

	const detailedSliderConfig: Settings = {
		className: styles.detailedSliderWrapper,
		swipe: canSwipe,
		vertical: true,
		arrows: false,
		swipeToSlide: true,
		verticalSwiping: true,
		asNavFor: thumbnailSliderRef.current ?? undefined,
		afterChange(i: number) { setCurrentSlide(i) },
	}

	// TODO: add current sale url and load that one if its present
	return (
		<div className={styles.estateSaleList}>

			{isDesktop ? (
				<div className={styles.thumbnailSliderWrapper}>
					<h3 className={styles.thumbnailSliderTitle}>Upcoming Sales</h3>
					<Slider {...thumbnailSliderConfig} ref={ref => thumbnailSliderRef.current = ref}>
						{saleInfo.map((sale, i) => <ThumbnailSaleCard key={sale.id} sale={sale} isActive={i === currentSlide} />)}
					</Slider>
					<div className={styles.prevNextContainer}>
						<button onClick={() => thumbnailSliderRef.current?.slickPrev()}>Prev</button>
						<button onClick={() => thumbnailSliderRef.current?.slickNext()}>next</button>
					</div>
				</div>
			) : null}

			<Slider {...detailedSliderConfig} ref={ref => detailedSliderRef.current = ref}>
				{saleInfo.map(sale => <DetailedSaleCard key={sale.id} sale={sale} onMouseEnter={() => setCanSwipe(false)} onMouseLeave={() => setCanSwipe(true)} />)}
			</Slider>
		</div>
	)
}

export default EstateSaleList
