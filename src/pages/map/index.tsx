import React, { useEffect, useRef, useState } from 'react';
// import { Loader } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { GoogleMap, useJsApiLoader, MarkerF, MarkerClustererF } from '@react-google-maps/api';
// import { MarkerClusterer } from "react-google-maps/lib/components/addons/MarkerClusterer";

import Router, { useRouter } from 'next/router';
import { CoordinateSaleData, MobileMapSaleViewType, SaleDetails } from '@/types';
import DetailedSaleCard from '../../components/estate-sale/detailed-sale-card';
import { getHelper } from '@/utils/utils';
import styles from '../../styles/map.module.scss';
import DisplayToggle from '@/components/display-toggle/display-toggle';
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

	// const mapRef = useRef<HTMLDivElement | null>(null);// ref for map
	// const mountedMap = useRef(false);

	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY ?? '',

	});

	const { query } = useRouter();
	const { isDesktop } = useScreenQuery();

	const getSaleView = () => saleView;

	// useEffect to load map
	// useEffect(() => {
	// 	if (!mapRef.current || mountedMap.current || !saleInfo?.length) return;
	// 	const loader = new Loader({
	// 		apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY ?? '',
	// 		version: "weekly",
	// 	});

	// 	loader.load()
	// 		.then(async () => {
	// 			if (!mapRef.current) return;

	// 			const firstSaleInfo = saleInfo.find(sale => sale.id.toString() === query?.sale_id) ?? saleInfo[0];

	// 			// initialize map
	// 			const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
	// 			const map = new Map(mapRef.current, {
	// 				center: firstSaleInfo.coordinates,
	// 				zoom: 11,
	// 				gestureHandling: !isDesktop ? 'greedy' : 'cooperative'
	// 			});

	// 			// initialize detail card
	// 			const [saleDetails] = await getHelper(`/api/estate-sale/sale-details/${firstSaleInfo.id}`);
	// 			setSaleDetails(saleDetails);
	// 			if (!isDesktop) setSaleView(MobileMapSaleViewType.minimized);

	// 			const markers = saleInfo.map(sale => {
	// 				const label = sale.address;
	// 				const marker = new google.maps.Marker({
	// 					position: sale.coordinates,
	// 					label,
	// 					map,
	// 					// icon: 'https://openmoji.org/data/color/svg/1F3E0.svg',
	// 				});

	// 				marker.addListener("click", async () => {
	// 					if (sale.id === saleDetails.id && getSaleView() === MobileMapSaleViewType.minimized) {
	// 						console.log('clicking same sale again');
	// 						setSaleView(MobileMapSaleViewType.hidden);
	// 						return;
	// 					}

	// 					// center map
	// 					const markerPosition = marker.getPosition();
	// 					if (markerPosition) map.panTo(markerPosition);

	// 					// show sale details
	// 					const [_saleDetails] = await getHelper(`/api/estate-sale/sale-details/${sale.id}`);
	// 					setSaleDetails(_saleDetails);

	// 					Router.push(
	// 						{
	// 							pathname: '',
	// 							query: { sale_id: sale.id }
	// 						},
	// 						undefined, // AS param is not needed here
	// 						{ shallow: true }
	// 					);

	// 					if (!isDesktop) {
	// 						setSaleView(MobileMapSaleViewType.minimized);
	// 					}
	// 				});

	// 				return marker;
	// 			});

	// 			new MarkerClusterer({ markers, map });

	// 			mountedMap.current = true;
	// 		});
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [saleInfo]);

	const firstSaleInfo = saleInfo.find(sale => sale.id.toString() === query?.sale_id) ?? saleInfo[0];

	return (isLoaded ? (
		<div className={styles.mapContainer}>
			<GoogleMap
				mapContainerClassName={styles.map}
				center={firstSaleInfo.coordinates}
				zoom={11}
				options={{ gestureHandling: !isDesktop ? 'greedy' : 'cooperative' }}
			>
				<MarkerClustererF
					averageCenter
					enableRetinaIcons
					gridSize={60}
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
										onClick={async e => {
											console.log('e', e);
											if (sale.id === saleDetails?.id && saleView === MobileMapSaleViewType.minimized) {
												console.log('clicking same sale again');
												setSaleView(MobileMapSaleViewType.hidden);
												return;
											}

											// show sale details
											const [_saleDetails] = await getHelper(`/api/estate-sale/sale-details/${sale.id}`);
											setSaleDetails(_saleDetails);

											Router.push(
												{
													pathname: '',
													query: { sale_id: sale.id }
												},
												undefined, // AS param is not needed here
												{ shallow: true }
											);

											if (!isDesktop) {
												setSaleView(MobileMapSaleViewType.minimized);
											}
										}}
									/>))}
							</>
						);
					}}
				</MarkerClustererF>
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
