import { useEffect, useState, useRef } from 'react';

const tabletBreakpoint = 1280
const mobileBreakpoint = 500

interface IUseScreenQueryReturn {
	isMobile: boolean;
	isTablet: boolean;
	isDesktop: boolean;
}

function useScreenQuery(timeoutMs = 500): IUseScreenQueryReturn {
	const [isMobile, setIsMobile] = useState(false);
	const [isTablet, setIsTablet] = useState(false);
	const [isDesktop, setIsDesktop] = useState(false);

	const timeout = useRef<NodeJS.Timeout>();

	useEffect(() => {
		const checkWindowSize = (eventWindow: Window) => {
			const width = eventWindow.innerWidth;

			if (width > tabletBreakpoint) {
				setIsDesktop(true);
				setIsTablet(false);
				setIsMobile(false);
			} else if (width < tabletBreakpoint && width > mobileBreakpoint) {
				setIsDesktop(false);
				setIsTablet(true);
				setIsMobile(false);
			} else if (width <= mobileBreakpoint) {
				setIsDesktop(false);
				setIsTablet(false);
				setIsMobile(true);
			}
		};

		const timeoutFunction = (e: UIEvent) => {
			if (timeout.current) clearTimeout(timeout.current);

			timeout.current = setTimeout(
				() => checkWindowSize(e.target as Window),
				timeoutMs
			);
		};

		window.addEventListener('resize', timeoutFunction);

		// need to check on mount as well
		checkWindowSize(window);

		return () => timeout.current && clearTimeout(timeout.current);
	}, [timeoutMs]);

	return {
		isMobile,
		isTablet,
		isDesktop,
	};
}

export default useScreenQuery;
