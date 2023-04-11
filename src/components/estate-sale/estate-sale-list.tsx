import Slider, { Settings } from 'react-slick';
import { Sale } from '@/types'
import SaleCard from './sale-card';

interface Props {
	saleInfo: Sale[];
}

function EstateSaleList(props: Props) {
	const { saleInfo } = props

	const sliderConfig: Settings = {}
	return (
		<div className="estate-sale-list">
			<Slider {...sliderConfig}>
				{saleInfo.map(sale => <SaleCard key={sale.id} sale={sale} />)}
			</Slider>
		</div>
	)
}

export default EstateSaleList
