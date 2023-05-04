import React, { useRef } from 'react';
import styles from '../../styles/map.module.scss';
import { CoordinateSaleData } from '@/types';
import { InfoBoxF } from '@react-google-maps/api';
import Slider, { Settings } from 'react-slick';

interface Props {
	saleList: CoordinateSaleData[];
	onSaleClick: (id: number) => void;
	onClose: () => void;
}

function InfoBox(props: Props) {
	const { saleList, onSaleClick, onClose } = props;

	const sliderRef = useRef<Slider | null>(null);

	const handleSaleClick: (id: number) => React.MouseEventHandler<HTMLDivElement> = (id) => async (e) => {
		e.stopPropagation();
		await onSaleClick(id);
	};

	const sliderConfig: Settings = {
		arrows: false,
		swipeToSlide: false,
		swipe: false,
		afterChange: (index) => { onSaleClick(saleList[index].id); }
	};

	return (
		<InfoBoxF
			position={new google.maps.LatLng(saleList[0].coordinates)}
			options={{ closeBoxURL: '', disableAutoPan: true, boxClass: styles.infoBoxS, visible: !!saleList, alignBottom: true }}
		>
			<div className={styles.infoBoxContainer} onTouchMove={e => e.stopPropagation()} >
				<p><strong>{saleList.length} sales</strong> in this zip code without addresses posted.</p>
				<br />
				<div className={styles.matchingSaleContainer}>
					<Slider {...sliderConfig} ref={ref => sliderRef.current = ref}>
						{saleList.map((sale, i) => {
							return (
								<div className={styles.matchingSale} key={sale.id} onClick={handleSaleClick(sale.id)}>
									<strong>{i + 1}.</strong>
									<br />
									{sale.address} <button className={styles.saleDetailsBtn}>See Details</button>
								</div>
							);
						})}
					</Slider>
					<div className={styles.sliderController}>
						<button onClick={() => sliderRef.current?.slickPrev()}>&lt;</button>
						<button onClick={() => sliderRef.current?.slickNext()}>&gt;</button>
					</div>
				</div>
				<button className={styles.closeBtn} onClick={onClose}>close</button>
			</div>
		</InfoBoxF>
	);
}

export default InfoBox;
