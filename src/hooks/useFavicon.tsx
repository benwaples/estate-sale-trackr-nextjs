import { useEffect, useState } from "react";

const faviconOptions = [
	'https://openmoji.org/data/color/svg/1F4B8.svg',
	'https://openmoji.org/data/color/svg/1F4B0.svg',
	'https://openmoji.org/data/color/svg/1F4B3.svg',
	'https://openmoji.org/data/color/svg/1F3E0.svg',
	'https://openmoji.org/data/color/svg/1F3E0.svg',
	'https://openmoji.org/data/color/svg/1F3DA.svg',
];

const useFavicon = () => {

	const [favicon, setFavicon] = useState(faviconOptions[0]);

	useEffect(() => {
		const getFavicon = () => {
			const faviconOption = faviconOptions[Math.floor(Math.random() * faviconOptions.length)];
			setFavicon(faviconOption);
		};
		const faviconTimeout = setInterval(getFavicon, 2000);

		return () => clearInterval(faviconTimeout);
	}, []);

	return favicon;

};

export default useFavicon;