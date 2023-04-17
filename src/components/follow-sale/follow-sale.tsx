import React from 'react'
import styles from '../../styles/estate-sale-list.module.scss'

interface Props { }

function FollowSale(props: Props) {
	const { } = props

	// follow sale - calls endpoint that adds this sale to followed_sales
	// unfollow sale - puts a status of inactive for the given followed_sale 
	return (
		<button className={styles.followSale}>Follow Sale</button>
	)
}

export default FollowSale
