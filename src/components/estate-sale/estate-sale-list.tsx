import Slider, { Settings } from 'react-slick';
import { Sale } from '@/types'
import SaleCard from './sale-card';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

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
