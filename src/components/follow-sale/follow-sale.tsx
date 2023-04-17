import React from 'react'
import styles from '../../styles/estate-sale-list.module.scss'
import { Sale } from '@/types'
import { postHelper } from '@/utils/utils'
import { useSession } from 'next-auth/react'

function FollowSale(props: Sale) {
	const { id, sale_id, Address, Dates } = props

	const { data, } = useSession()
	console.log(data)
	const isFollowingSale = data?.user.followed_sales?.includes(sale_id) ?? false;
	// follow sale - calls endpoint that adds this sale to followed_sales
	const followSale = async () => {
		// if no email, should display a modal for SSO
		if (!data?.user?.email) return;
		let start_date;
		let end_date;
		if (typeof Dates === 'object') {
			start_date = Dates.startTime
			end_date = Dates.endTime
		}
		// TODO: add notification that this sale has been followed - if not number attached to account, ask if they wanna add one
		const followedSale = await postHelper('/api/estate-sale/follow-sale', { sale_id, follower_email: data.user.email, address: Address, start_date, end_date })
	}
	// unfollow sale - puts a status of inactive for the given followed_sale 
	const unfollowSale = async () => {

	}

	const handleClick = async () => {
		// if following, unfollow
		// if not following, follow
		followSale()
	}
	return (
		<button className={styles.followSale} onClick={handleClick}>{isFollowingSale ? 'Unfollow' : 'Follow'}</button>
	)
}

export default FollowSale
