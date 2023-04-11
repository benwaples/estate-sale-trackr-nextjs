import Slider, { Settings } from 'react-slick';
import { Sale } from '@/types'
import SaleCard from './sale-card';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from '../../styles/estate-sale-list.module.scss'

interface Props {
	saleInfo: Sale[];
}

function EstateSaleList(props: Props) {
	const { saleInfo } = props

	const sliderConfig: Settings = {}

	// TODO: add current sale url and load that one if its present
	return (
		<div className={styles.estateSaleList}>
			<Slider {...sliderConfig}>
				{saleInfo.map(sale => <SaleCard key={sale.id} sale={sale} />)}
			</Slider>
		</div>
	)
}

export default EstateSaleList
