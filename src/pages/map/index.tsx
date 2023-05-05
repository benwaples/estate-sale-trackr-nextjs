import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, MarkerClustererF, InfoBoxF } from '@react-google-maps/api';
import { Cluster } from '@react-google-maps/marker-clusterer/dist';
import Router, { useRouter } from 'next/router';
import cn from 'classnames';

import { CoordinateSaleData, MobileMapSaleViewType, SaleDetails } from '@/types';
import DetailedSaleCard from '../../components/estate-sale/detailed-sale-card';
import { getHelper, toMap } from '@/utils/utils';
import styles from '../../styles/map.module.scss';
import useScreenQuery from '@/hooks/use-screen-query';
import { allUpcomingSaleIds } from '../api/estate-sale/all-upcoming-sales';
import MobileMapDetailedSale from '@/components/estate-sale/mobile-map-detailed-sale';
import InfoBox from '../../components/estate-sale/infobox';

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
	const [displaySales, setDisplaySales] = useState(saleInfo);

	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY ?? '',
	});

	const { query } = useRouter();
	const { isDesktop } = useScreenQuery();

	const mapRef = useRef<google.maps.Map | null>();
	const saleInfoMap: { [id: string]: CoordinateSaleData } = useMemo(() => toMap(saleInfo, 'id'), [saleInfo]);

	const getSaleDetails = useCallback(async (saleId: number) => {

		if (!isDesktop) {
			setSaleView(MobileMapSaleViewType.minimized);
		}

		if (saleId === saleDetails?.id) return;
		setSaleDetails(null);

		const [_saleDetails] = await getHelper(`/api/estate-sale/sale-details/${saleId}`);
		setSaleDetails(_saleDetails);
		Router.push(
			{
				pathname: '',
				query: { ...query, sale_id: saleId }
			},
			undefined, // AS param is not needed here
			{ shallow: true }
		);


	}, [isDesktop, query, saleDetails?.id]);

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

	const handleClusterClick = async (cluster: Cluster) => {
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

			// automatically open the first sale in details
			const firstSaleDetails = details[0];
			if (!firstSaleDetails) return;

			details[0]?.id && await getSaleDetails(firstSaleDetails?.id);

			return;
		} else {
			setSalesWithMatchingPositions(null);
		}

		map.set('zoom', zoom + 1);
	};

	const handleSalesThisWeekClick = useCallback((displaySalesThisWeek: boolean) => {
		if (displaySalesThisWeek) {
			const salesThisWeek = saleInfo.filter(sale => !sale.isThisWeek);
			setDisplaySales(saleInfo.filter(sale => !sale.isThisWeek));
			Router.push(
				{
					pathname: '',
					query: { ...query, sales_this_week: true }
				},
				undefined, // AS param is not needed here
				{ shallow: true }
			);

			// if currently viewed sale doesnt belong to sales this week lets pan to the first sale in list this week.
			if (!salesThisWeek.find(sale => sale.id === saleDetails?.id)) mapRef.current?.panTo(salesThisWeek[0].coordinates);

		} else {
			setDisplaySales(saleInfo);
			const { sales_this_week, ..._query } = query;

			Router.push(
				{
					pathname: '',
					query: _query
				},
				undefined, // AS param is not needed here
				{ shallow: true }
			);
		}
	}, [query, saleDetails?.id, saleInfo]);

	// should only run on mount
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const firstSaleInfo = useMemo(() => saleInfo.find(sale => sale.id.toString() === query?.sale_id) ?? saleInfo[0], []);

	const onMapLoad = useCallback(async (map: google.maps.Map) => {
		mapRef.current = map;
		if (firstSaleInfo) {
			await getSaleDetails(firstSaleInfo.id);
		}
		if (query.sales_this_week) {
			// if sales this week filter is on then display sales this week as long as first sale info belongs in this week. 
			handleSalesThisWeekClick(!saleInfo.find(sale => sale.id === firstSaleInfo.id && sale.isThisWeek));
		}
	}, [firstSaleInfo, getSaleDetails, handleSalesThisWeekClick, query.sales_this_week, saleInfo]);

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
								{displaySales.map(sale => (
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
					<InfoBox
						saleList={salesWithMatchingPositions}
						onSaleClick={async (id) => {
							await getSaleDetails(id);
							mapRef.current?.panTo(new google.maps.LatLng(salesWithMatchingPositions[0].coordinates));
						}}
						onClose={() => setSalesWithMatchingPositions(null)}
					/>
				) : null}
				{!isDesktop ? (
					<MobileMapDetailedSale
						sale={saleDetails}
						view={{ type: saleView, handleViewChange: setSaleView }}
						host={saleDetails?.id ? saleInfoMap[saleDetails.id]?.host : undefined}
						hostUrl={saleDetails?.id ? saleInfoMap[saleDetails.id]?.hostUrl : undefined}
					/>
				) : null}
				<button className={cn(styles.salesThisWeekBtn, { [styles.active]: query.sales_this_week })} onClick={() => handleSalesThisWeekClick(!query.sales_this_week)}>Sales This Week</button>
			</GoogleMap>
			{isDesktop ? (
				<DetailedSaleCard
					key={saleDetails?.id}
					sale={saleDetails}
					saleId={saleDetails?.id}
					host={saleDetails?.id ? saleInfoMap[saleDetails.id]?.host : undefined}
					hostUrl={saleDetails?.id ? saleInfoMap[saleDetails.id]?.hostUrl : undefined}
				/>
			) : null}
		</div>
	) : null);
}

export default Map;
