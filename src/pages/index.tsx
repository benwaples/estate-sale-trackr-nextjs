import Head from 'next/head';
import Nav from '@/components/nav/nav';
import { useEffect, useState } from 'react';
import Router, { useRouter } from 'next/router';
import EstateSaleList from '@/pages/list';
import { allUpcomingSaleIds } from './api/estate-sale/all-upcoming-sales';
import { BaseSaleData, CoordinateSaleData } from '@/types';
import Map from '@/pages/map';

const faviconOptions = [
  'https://openmoji.org/data/color/svg/1F4B8.svg',
  'https://openmoji.org/data/color/svg/1F4B0.svg',
  'https://openmoji.org/data/color/svg/1F4B3.svg',
  'https://openmoji.org/data/color/svg/1F3E0.svg',
  'https://openmoji.org/data/color/svg/1F3E0.svg',
  'https://openmoji.org/data/color/svg/1F3DA.svg',
];

// export const getServerSideProps = async () => {
//   const saleInfo = await allUpcomingSaleIds(true);
//   return { props: { saleInfo } }; // will be passed to the page component as props
// };

interface Props {
  saleInfo?: CoordinateSaleData[];
}

function Home(props: Props) {
  const { saleInfo } = props;

  const [favicon, setFavicon] = useState(faviconOptions[0]);

  const { query, pathname } = useRouter();

  useEffect(() => {
    const getFavicon = () => {
      const faviconOption = faviconOptions[Math.floor(Math.random() * faviconOptions.length)];
      setFavicon(faviconOption);
    };
    const faviconTimeout = setInterval(getFavicon, 2000);

    return () => clearInterval(faviconTimeout);
  }, []);

  useEffect(() => {
    if (!pathname.includes('map') && !pathname.includes('list')) {
      Router.push('/map');
    }
  }, [pathname]);

  return (
    <>
      <Head>
        <title>Estate Sale Trackr</title>
        <meta name="description" content="wewa created this" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={favicon} />
      </Head>
      <div style={{ minHeight: '100vh', display: 'flex' }}>

        {/* <Nav /> */}
        {/* TODO: add support for a calendar view */}
        {/* {displayType === 'list' ? (
          <EstateSaleList saleInfo={saleInfo ?? []} />
        ) : (
          <Map saleInfo={saleInfo ?? []} />
        )} */}
      </div>
    </>
  );
}

export default Home;
