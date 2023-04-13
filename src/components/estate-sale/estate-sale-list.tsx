import { useRef, useState } from 'react';
import Slider, { Settings } from 'react-slick';
import cn from 'classnames'
import { Sale } from '@/types'
import DetailedSaleCard from './detailed-sale-card';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from '../../styles/estate-sale-list.module.scss'
import ThumbnailSaleCard from './thumbnail-sale-card';

interface IArrowProps {
	direction: "up" | "down" | "right" | "left";
	onClick?: () => void;
	className?: string;
}

function Arrow(props: IArrowProps) {
	const { direction, onClick, className } = props;

	return <div onClick={onClick} className={cn(className, styles.thumbnailArrow, styles[direction])}>&lt;</div>
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

	const thumbnailSliderConfig: Settings = {
		className: styles.thumbnailSlider,
		slidesToShow: 10,
		// centerMode: true,
		swipe: canSwipe,
		asNavFor: detailedSliderRef.current ?? undefined,
		vertical: true,
		swipeToSlide: true,
		focusOnSelect: true,
		arrows: false,
		afterChange(i: number) { setCurrentSlide(i) },
	}

	const detailedSliderConfig: Settings = {
		className: styles.detailedSliderWrapper,
		swipe: canSwipe,
		asNavFor: thumbnailSliderRef.current ?? undefined,
		afterChange(i: number) { setCurrentSlide(i) },
	}

	// TODO: add current sale url and load that one if its present
	return (
		<div className={styles.estateSaleList}>

			<div className={styles.thumbnailSliderWrapper}>
				<Slider {...thumbnailSliderConfig} ref={ref => thumbnailSliderRef.current = ref}>
					{saleInfo.map((sale, i) => <ThumbnailSaleCard key={sale.id} sale={sale} isActive={i === currentSlide} />)}
				</Slider>
				<div className={styles.prevNextContainer}>
					<button onClick={() => thumbnailSliderRef.current?.slickPrev()}>Prev</button>
					<button onClick={() => thumbnailSliderRef.current?.slickNext()}>next</button>
				</div>
			</div>

			<Slider {...detailedSliderConfig} ref={ref => detailedSliderRef.current = ref}>
				{saleInfo.map(sale => <DetailedSaleCard key={sale.id} sale={sale} onMouseEnter={() => setCanSwipe(false)} onMouseLeave={() => setCanSwipe(true)} />)}
			</Slider>
		</div>
	)
}

export default EstateSaleList
