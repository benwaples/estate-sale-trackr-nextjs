import React, { useEffect, useRef, useState } from 'react';
import { Loader } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import Router, { useRouter } from 'next/router';
import { CoordinateSaleData, SaleDetails } from '@/types';
import DetailedSaleCard from '../detailed-sale-card';
import { getHelper } from '@/utils/utils';
import styles from '../../../styles/map.module.scss';
import DisplayToggle from '@/components/display-toggle/display-toggle';
import useScreenQuery from '@/hooks/use-screen-query';

interface Props {
	saleInfo: CoordinateSaleData[];
}

function Map(props: Props) {
	const { saleInfo } = props;

	const [saleDetails, setSaleDetails] = useState<SaleDetails | null>(null);

	const mapRef = useRef<HTMLDivElement | null>(null);// ref for map
	const mountedMap = useRef(false);

	const { query } = useRouter();
	const { isMobile } = useScreenQuery();

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

				const firstSaleInfo = saleInfo.find(sale => sale.id.toString() === query?.sale_id) ?? saleInfo[0];

				// initialize map
				const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
				const map = new Map(mapRef.current, {
					center: firstSaleInfo.coordinates,
					zoom: 11,
				});

				// initialize detail card
				const [saleDetails] = await getHelper(`/api/estate-sale/sale-details/${firstSaleInfo.id}`);
				setSaleDetails(saleDetails);

				const markers = saleInfo.map(sale => {
					const label = sale.address;
					const marker = new google.maps.Marker({
						position: sale.coordinates,
						label,
						map,
						// icon: 'https://openmoji.org/data/color/svg/1F3E0.svg',
					});

					marker.addListener("click", async () => {
						// center map
						const markerPosition = marker.getPosition();
						if (markerPosition) map.panTo(markerPosition);

						// show sale details
						const [saleDetails] = await getHelper(`/api/estate-sale/sale-details/${sale.id}`);
						setSaleDetails(() => saleDetails);
						Router.push(
							{
								pathname: '',
								query: { ...query, sale_id: sale.id }
							},
							undefined, // AS param is not needed here
							{ shallow: true }
						);
					});

					return marker;
				});

				new MarkerClusterer({ markers, map });

				mountedMap.current = true;
			});
	}, [saleInfo]);

	return (
		<div className={styles.mapContainer} style={{ display: 'flex', flexDirection: 'column-reverse' }}>
			<div ref={mapRef} style={{ width: isMobile ? "100%" : "800px", height: "400px", margin: 'auto' }} />
			{saleDetails ? (
				<DetailedSaleCard key={saleDetails.id} sale={saleDetails} saleId={saleDetails.id} />
			) : null}
			<DisplayToggle />
		</div>
	);
}

export default Map;

