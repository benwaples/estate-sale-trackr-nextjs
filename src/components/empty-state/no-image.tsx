import Image from 'next/image';
import cn from 'classnames';
import styles from '../../styles/no-image.module.scss';

interface Props {
	description?: string;
	classname?: string;
}

function NoImage(props: Props) {
	const { description, classname } = props;
	return (
		<div className={cn(styles.noImage, classname)}>
			<div className={styles.imageWrapper}>
				<Image
					src="/camera.svg"
					alt="image not found"
					width={60}
					height={60}
				/>
			</div>
			<p className={styles.noImageDescription}>{description ?? 'Image not found'}</p>
		</div>
	);
}

export default NoImage;
