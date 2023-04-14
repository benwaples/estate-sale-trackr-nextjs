import cn from 'classnames'
import { BaseSaleData, Sale } from '@/types';
import styles from '../../styles/estate-sale-list.module.scss'

interface Props {
	sale: BaseSaleData;
	isActive: boolean;
}


function ThumbnailSaleCard(props: Props) {
	const { sale, isActive } = props

	const address: string = sale.address
	const id = sale.id

	const getThumbnailText = () => {
		if (!address) return id

		if (address.toLowerCase().includes('not posted')) {
			const region = address.split('-')[1]
			return `${region} - ${id}`
		}

		return address
	}

	return (
		<div className={cn(styles.thumbnailSale, { [styles.activeThumbnail]: isActive })}>{getThumbnailText()}</div>
	)
}

export default ThumbnailSaleCard
