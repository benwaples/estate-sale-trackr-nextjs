import Head from 'next/head';
import Nav from '@/components/nav/nav';
import { useEffect, useState } from 'react';
import Router, { useRouter } from 'next/router';
import EstateSaleList from '@/pages/list';
import { allUpcomingSaleIds } from './api/estate-sale/all-upcoming-sales';
import { BaseSaleData, CoordinateSaleData } from '@/types';
import Map from '@/pages/map';


// export const getServerSideProps = async () => {
//   const saleInfo = await allUpcomingSaleIds(true);
//   return { props: { saleInfo } }; // will be passed to the page component as props
// };

interface Props {
  saleInfo?: CoordinateSaleData[];
}

function Home(props: Props) {
  const { saleInfo } = props;

  const { query, pathname } = useRouter();

  useEffect(() => {
    if (!pathname.includes('map') && !pathname.includes('list')) {
      Router.push('/map');
    }
  }, [pathname]);

  return (
    <>
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
