import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, MarkerClustererF, InfoBoxF } from '@react-google-maps/api';
import { Cluster } from '@react-google-maps/marker-clusterer/dist';
import Router, { useRouter } from 'next/router';

import { CoordinateSaleData, MobileMapSaleViewType, SaleDetails } from '@/types';
import DetailedSaleCard from '../../components/estate-sale/detailed-sale-card';
import { getHelper } from '@/utils/utils';
import styles from '../../styles/map.module.scss';
import useScreenQuery from '@/hooks/use-screen-query';
import { allUpcomingSaleIds } from '../api/estate-sale/all-upcoming-sales';
import MobileMapDetailedSale from '@/components/estate-sale/mobile-map-detailed-sale';

export const getServerSideProps = async () => {
	const saleInfo = await allUpcomingSaleIds(true);
	return { props: { saleInfo } }; // will be passed to the page component as props
};


interface Props {
	saleInfo: CoordinateSaleData[];
}

function Map(props: Props) {
	const { saleInfo } = props;

	const [saleDetails, setSaleDetails] = useState<SaleDetails | null>(null);
	const [saleView, setSaleView] = useState<MobileMapSaleViewType>(MobileMapSaleViewType.hidden);
	const [salesWithMatchingPositions, setSalesWithMatchingPositions] = useState<CoordinateSaleData[] | null>(null);

	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY ?? '',
	});

	const { query } = useRouter();
	const { isDesktop } = useScreenQuery();

	const mapRef = useRef<google.maps.Map | null>();

	const getSaleDetails = useCallback(async (saleId: number) => {
		const [_saleDetails] = await getHelper(`/api/estate-sale/sale-details/${saleId}`);
		setSaleDetails(_saleDetails);

		Router.push(
			{
				pathname: '',
				query: { sale_id: saleId }
			},
			undefined, // AS param is not needed here
			{ shallow: true }
		);

		if (!isDesktop) {
			setSaleView(MobileMapSaleViewType.minimized);
		}
	}, [isDesktop]);

	const handleMarkerClick = async (e: google.maps.MapMouseEvent, sale: CoordinateSaleData) => {
		if (mapRef.current && e.latLng) mapRef.current.panTo(e.latLng);
		if (sale.id === saleDetails?.id && saleView === MobileMapSaleViewType.minimized) {
			setSaleView(MobileMapSaleViewType.hidden);
			return;
		}
		if (salesWithMatchingPositions) setSalesWithMatchingPositions(null);

		// show sale details
		getSaleDetails(sale.id);
	};

	const handleClusterClick = (cluster: Cluster) => {
		const markers = cluster.getMarkers();
		const firstMarkerPosition = markers[0]?.getPosition();
		if (!firstMarkerPosition) return;

		const map = mapRef.current;
		const zoom = map?.getZoom();
		if (!map || !zoom) return;

		const center = cluster.getCenter();
		if (center) map.panTo(center);

		const allMarkerPositionsMatch = markers.every(marker => marker.getPosition()?.equals(firstMarkerPosition));
		if (allMarkerPositionsMatch) {
			const details = markers
				.map(marker => saleInfo.find(sale => sale.address === marker.getLabel()))
				.filter(el => !!el);

			if (!details.length) return;

			setSalesWithMatchingPositions(details as CoordinateSaleData[]);
			// keep the map at the same zoom level
			return;
		} else {
			setSalesWithMatchingPositions(null);
		}

		map.set('zoom', zoom + 1);
	};

	// should only run on mount
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const firstSaleInfo = useMemo(() => saleInfo.find(sale => sale.id.toString() === query?.sale_id) ?? saleInfo[0], []);

	const onMapLoad = useCallback(async (map: google.maps.Map) => {
		mapRef.current = map;
		if (firstSaleInfo) {
			await getSaleDetails(firstSaleInfo.id);
		}
	}, [firstSaleInfo, getSaleDetails]);

	console.log('salesWithMatching', salesWithMatchingPositions);
	return (isLoaded ? (
		<div className={styles.mapContainer}>
			<GoogleMap
				mapContainerClassName={styles.map}
				center={firstSaleInfo.coordinates}
				zoom={11}
				options={{ gestureHandling: !isDesktop ? 'greedy' : 'cooperative', zoomControl: true, clickableIcons: false, }}
				onLoad={onMapLoad}
			>
				<MarkerClustererF
					averageCenter
					enableRetinaIcons
					gridSize={60}
					onClick={handleClusterClick}
					zoomOnClick={false}
				>
					{(c) => {
						return (
							<>
								{saleInfo.map(sale => (
									<MarkerF
										key={sale.id}
										position={sale.coordinates}
										label={sale.address}
										clusterer={c}
										onClick={async e => await handleMarkerClick(e, sale)}
										animation={window.google.maps.Animation.DROP}
									/>))}
							</>
						);
					}}
				</MarkerClustererF>
				{salesWithMatchingPositions ? (
					<InfoBoxF
						position={new google.maps.LatLng(salesWithMatchingPositions[0].coordinates)}
						options={{ closeBoxURL: '', disableAutoPan: true, boxClass: styles.infoBoxS, visible: !!salesWithMatchingPositions, alignBottom: true }}
					>
						<div className={styles.infoBoxContainer} >
							<p>{salesWithMatchingPositions.length} sales in this zipcode without adddress posted</p>
							<br />
							<div className={styles.matchingSaleContainer}>
								{salesWithMatchingPositions.map(sale => {
									return (
										<div className={styles.matchingSale} key={sale.id} onClick={async (e) => {
											e.stopPropagation();
											await getSaleDetails(sale.id);
											mapRef.current?.panTo(new google.maps.LatLng({ ...salesWithMatchingPositions[0].coordinates, lat: salesWithMatchingPositions[0].coordinates.lat - 0.00274 }));
										}}>
											{sale.address}
										</div>
									);
								})}
							</div>
							<button onClick={() => setSalesWithMatchingPositions(null)}>close</button>
						</div>
					</InfoBoxF>
				) : null}
				{!isDesktop ? (
					<MobileMapDetailedSale sale={saleDetails} view={{ type: saleView, handleViewChange: setSaleView }} />
				) : null}
			</GoogleMap>
			{(saleDetails && isDesktop) ? <DetailedSaleCard key={saleDetails.id} sale={saleDetails} saleId={saleDetails.id} /> : null}
		</div>
	) : null);
	// <>
	// 	{/* {!isDesktop ? (
	// 		<div className={styles.fakeHeader}><h1>Estate Sale Tracker</h1></div>
	// 	) : null} */}
	// 	<div className={styles.mapContainer}>
	// 		<div ref={mapRef} className={styles.map} >
	// 			{!isDesktop ? (
	// 				<MobileMapDetailedSale sale={saleDetails} view={{ type: saleView, handleViewChange: setSaleView }} />
	// 			) : null}
	// 		</div>
	// 		{(saleDetails && isDesktop) ? <DetailedSaleCard key={saleDetails.id} sale={saleDetails} saleId={saleDetails.id} /> : null}
	// 		{/* <DisplayToggle /> */}
	// 	</div>
	// </>
	// );
}

export default Map;
