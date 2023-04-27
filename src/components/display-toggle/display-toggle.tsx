import Router, { useRouter } from 'next/router';
import cn from 'classnames';

interface Props { }

function DisplayToggle(props: Props) {
	const { } = props;

	const router = useRouter();
	const activeDisplay = router.pathname.includes('map') ? 'map' : 'list';
	console.log('activeDisplay', activeDisplay);
	function handleClick() {
		if (activeDisplay === 'list') {
			router.push('/map');
			return;
		}
		router.push('/list');
	}

	return (
		<div>
			{activeDisplay === 'map' ? (
				<button onClick={handleClick} className={'display-toggle'}>View List</button>
			) : (
				<button onClick={handleClick} className={'display-toggle'}>View Map</button>
			)}
		</div>
	);
}

export default DisplayToggle;
