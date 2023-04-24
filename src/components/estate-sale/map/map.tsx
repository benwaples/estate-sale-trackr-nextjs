import React, { useEffect, useRef, useState } from 'react';
import ReactDomServer from 'react-dom/server';
import { Loader } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { CoordinateSaleData, SaleDetails } from '@/types';
import DetailedSaleCard from '../detailed-sale-card';
import { getHelper } from '@/utils/utils';
import styles from '../../../styles/map.module.scss';

interface Props {
	saleInfo: CoordinateSaleData[];
}

function Map(props: Props) {
	const { saleInfo } = props;

	const [saleDetails, setSaleDetails] = useState<SaleDetails | null>(null);

	const mapRef = useRef<HTMLDivElement | null>(null);// ref for map
	const mountedMap = useRef(false);

	// useEffect to load map
	useEffect(() => {
		if (!mapRef.current || mountedMap.current || !saleInfo?.length) return;
		const loader = new Loader({
			apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY ?? '',
			version: "weekly",
		});

		loader.load()
			.then(async () => {
				if (!mapRef.current) return;

				const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
				const map = new Map(mapRef.current, {
					center: { lat: 45.5152, lng: -122.6784 },
					zoom: 11,
				});

				const infoWindow = new google.maps.InfoWindow({
					content: "",
					disableAutoPan: true,

				});

				const markers = saleInfo.map(sale => {
					const label = sale.address;
					const marker = new google.maps.Marker({
						position: sale.coordinates,
						label
					});

					marker.addListener("click", async () => {
						const [saleDetails] = await getHelper(`/api/estate-sale/sale-details/${sale.id}`);

						setSaleDetails(saleDetails);

						infoWindow.setContent('see details card');
						infoWindow.open(map, marker);
					});

					return marker;
				});

				new MarkerClusterer({ markers, map });

				mountedMap.current = true;
			});
	}, [saleInfo]);

	return (
		<div className={styles.mapContainer}>
			<div ref={mapRef} style={{ width: "800px", height: "400px", margin: 'auto' }} />
			{saleDetails ? (
				<DetailedSaleCard sale={saleDetails} saleId={saleDetails.id} />
			) : null}
		</div>
	);
}

export default Map;

