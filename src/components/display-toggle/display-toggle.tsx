import Router, { useRouter } from 'next/router';
import cn from 'classnames';

interface Props { }

function DisplayToggle(props: Props) {
	const { } = props;

	const { query } = useRouter();

	function handleClick() {
		const { display_type, ...rest } = query;
		if (display_type === 'list') {
			Router.push({ href: '/', query: { ...rest, display_type: 'map' } }, undefined, { shallow: true });
			return;
		}
		Router.push({ href: '/', query: { ...rest, display_type: 'list' } }, undefined, { shallow: true });
	}

	const activeDisplay = query.display_type ?? 'map';
	return (
		<div>
			<button onClick={handleClick} className={cn('display-button', { active: activeDisplay === 'list' })}>List</button>
			<button onClick={handleClick} className={cn('display-button', { active: activeDisplay === 'map' })}>Map</button>
		</div>
	);
}

export default DisplayToggle;
