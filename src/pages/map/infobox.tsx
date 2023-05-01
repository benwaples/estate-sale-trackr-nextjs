import React from 'react';
import styles from '../../styles/map.module.scss';
import { CoordinateSaleData } from '@/types';
import { InfoBoxF } from '@react-google-maps/api';

interface Props {
	saleList: CoordinateSaleData[];
	onSaleClick: (id: number) => void;
	onClose: () => void;
}

function InfoBox(props: Props) {
	const { saleList, onSaleClick, onClose } = props;

	const handleSaleClick: (id: number) => React.MouseEventHandler<HTMLDivElement> = (id) => async (e) => {
		e.stopPropagation();
		await onSaleClick(id);
	};

	return (
		<InfoBoxF
			position={new google.maps.LatLng(saleList[0].coordinates)}
			options={{ closeBoxURL: '', disableAutoPan: true, boxClass: styles.infoBoxS, visible: !!saleList, alignBottom: true }}
		>
			<div className={styles.infoBoxContainer} >
				<p>{saleList.length} sales in this zipcode without adddress posted</p>
				<br />
				<div className={styles.matchingSaleContainer}>
					{saleList.map(sale => {
						return (
							<div className={styles.matchingSale} key={sale.id} onClick={handleSaleClick(sale.id)}>
								{sale.address}
							</div>
						);
					})}
				</div>
				<button onClick={onClose}>close</button>
			</div>
		</InfoBoxF>
	);
}

export default InfoBox;
