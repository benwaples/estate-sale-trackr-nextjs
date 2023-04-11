import { Dictionary } from '@/types'
import { allUpcomingSalesHandler } from '@/pages/api/estate-sale/all-upcoming-sales'

interface Props {
	saleInfo: Dictionary[];
}

function EstateSaleList(props: Props) {
	const { saleInfo } = props

	return (
		<div className="estate-sale-list">

		</div>
	)
}

export default EstateSaleList
