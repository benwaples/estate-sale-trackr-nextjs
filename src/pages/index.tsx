import Head from 'next/head'
import Nav from '@/components/nav/nav'
import { useEffect, useState } from 'react'
import EstateSaleList from '@/components/estate-sale/estate-sale-list'
const faviconOptions = [
  'https://openmoji.org/data/color/svg/1F92A.svg',
  'https://openmoji.org/data/color/svg/1F4B8.svg',
  'https://openmoji.org/data/color/svg/1F4B0.svg',
  'https://openmoji.org/data/color/svg/1F4B3.svg',
  'https://openmoji.org/data/color/svg/1F3E0.svg',
  'https://openmoji.org/data/color/svg/1F3E0.svg',
  'https://openmoji.org/data/color/svg/1F3DA.svg',
]

export default function Home() {

  const [favicon, setFavicon] = useState(faviconOptions[0])

  useEffect(() => {
    const getFavicon = () => {
      const faviconOption = faviconOptions[Math.floor(Math.random() * faviconOptions.length)]
      setFavicon(faviconOption)
    }
    const faviconTimeout = setInterval(getFavicon, 2000)

    return () => clearInterval(faviconTimeout)
  }, [])

  return (
    <>
      <Head>
        <title>Estate Sale Trackr</title>
        <meta name="description" content="wewa created this" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={favicon} />
      </Head>
      <Nav />
      <EstateSaleList />
    </>
  )
}
