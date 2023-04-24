import React, { useEffect, useRef } from 'react';
import { Loader } from "@googlemaps/js-api-loader";

interface Props { }

function Map(props: Props) {
	const { } = props;

	const mapRef = useRef<HTMLDivElement | null>(null);// ref for map
	const mountedMap = useRef(false);

	// useEffect to load map
	useEffect(() => {
		if (!mapRef.current || mountedMap.current) return;
		const loader = new Loader({
			apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY ?? '',
			version: "weekly",
		});

		loader.load()
			.then(async () => {
				if (!mapRef.current) return;

				const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
				new Map(mapRef.current, {
					center: { lat: 45.5152, lng: -122.6784 },
					zoom: 11,
				});

				mountedMap.current = true;
			});
	}, []);

	return (
		<div ref={mapRef} style={{ width: "1440px", height: "400px", margin: 'auto' }}>
			hellow world
		</div>
	);
}

export default Map;

