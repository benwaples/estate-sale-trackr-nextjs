import React, { useState } from 'react'
import styles from '../../styles/estate-sale-list.module.scss'
import { SaleDetails } from '@/types'
import { postHelper } from '@/utils/utils'
import { useSession } from 'next-auth/react'

function FollowSale(props: SaleDetails) {
	const { id, sale_id, address, dates } = props

	const { data, update } = useSession()
	const [loading, setLoading] = useState(false)

	const isFollowingSale = data?.user.followed_sales?.includes(sale_id) ?? false;

	const followSale = async () => {
		// TODO: if no email, should display a modal for SSO
		if (!data?.user?.email) return;
		let start_time;
		let end_time;
		if (typeof dates === 'object') {
			start_time = dates.startTime
			end_time = dates.endTime
		}
		// TODO: add notification that this sale has been followed - if not number attached to account, ask if they wanna add one
		try {
			setLoading(true)
			const followedSale = await postHelper('/api/estate-sale/follow-sale', { sale_id, follower_email: data.user.email, address, start_time, end_time })

			// updates current user session with newly followed sale
			await update({ ...data, user: { ...data.user, followed_sales: [...(data.user.followed_sales ?? []), followedSale.sale_id] } })
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}
	// unfollow sale - puts a status of inactive for the given followed_sale 
	const unfollowSale = async () => {
		if (!data?.user?.email) return;

		try {
			setLoading(true)
			await postHelper(`/api/estate-sale/unfollow-sale/${sale_id}`, { email: data?.user?.email })
			await update({ ...data, user: { ...data.user, followed_sales: (data.user.followed_sales ?? []).filter(saleId => saleId !== sale_id) } })
		} catch (error) {
			console.error(error)
		} finally {
			setLoading(false)
		}
	}

	const handleClick = async () => {
		// if following, unfollow
		if (isFollowingSale) {
			unfollowSale()
		} else {
			// if not following, follow
			followSale()
		}
	}

	const buttonText = isFollowingSale ? 'Unfollow' : 'Follow';

	return (
		<button className={styles.followSale} onClick={handleClick}>{loading ? "Loading..." : buttonText}</button>
	)
}

export default FollowSale
