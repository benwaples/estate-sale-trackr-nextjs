import { Sale } from '@/types'
import React from 'react'

interface Props {
	sale: Sale;
}

function SaleCard(props: Props) {
	const { sale } = props

	return (
		<div className="sale-card" style={{ height: '200px', width: '200px' }}>
			<h1>{sale.id}</h1>
		</div>
	)
}

export default SaleCard
