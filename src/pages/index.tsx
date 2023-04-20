import Head from 'next/head';
import Nav from '@/components/nav/nav';
import { useEffect, useState } from 'react';
import EstateSaleList from '@/components/estate-sale/estate-sale-list';
import { allUpcomingSaleIds } from './api/estate-sale/all-upcoming-sales';
import { BaseSaleData } from '@/types';

const faviconOptions = [
  'https://openmoji.org/data/color/svg/1F92A.svg',
  'https://openmoji.org/data/color/svg/1F4B8.svg',
  'https://openmoji.org/data/color/svg/1F4B0.svg',
  'https://openmoji.org/data/color/svg/1F4B3.svg',
  'https://openmoji.org/data/color/svg/1F3E0.svg',
  'https://openmoji.org/data/color/svg/1F3E0.svg',
  'https://openmoji.org/data/color/svg/1F3DA.svg',
];

export const getServerSideProps = async () => {
  const saleInfo = await allUpcomingSaleIds();
  return { props: { saleInfo } }; // will be passed to the page component as props
};

interface Props {
  saleInfo?: BaseSaleData[];
}

function Home(props: Props) {
  const { saleInfo } = props;
  const [favicon, setFavicon] = useState(faviconOptions[0]);

  useEffect(() => {
    const getFavicon = () => {
      const faviconOption = faviconOptions[Math.floor(Math.random() * faviconOptions.length)];
      setFavicon(faviconOption);
    };
    const faviconTimeout = setInterval(getFavicon, 2000);

    return () => clearInterval(faviconTimeout);
  }, []);

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
        <EstateSaleList saleInfo={saleInfo ?? []} />

      </div>
    </>
  );
}

export default Home;

/**
 *  SW Portland',
    follower_email: 'benwaples@gmail.com',
    start_time: 1682158500000,
    end_time: 1682254800000,
    user_given_name: null
  },
  {
    id: 34,
    sale_id: 11976,
    address: 'Not Posted - Region: SW Portland',
    follower_email: 'benwaples@gmail.com',
    start_time: 1682154000000,
    end_time: 1682265600000,
    user_given_name: null
  },
  {
    id: 9,
    sale_id: 11984,
    address: '35513 NE 119th Avenue  La Center  WA 98629',
    follower_email: 'benwaples@gmail.com',
    start_time: 1682067600000,
    end_time: 1682269200000,
    user_given_name: null
  },
  {
    id: 10,
    sale_id: 11978,
    address: '2106 NE Village Green Drive Vancouver  WA 98684',
    follower_email: 'benwaples@gmail.com',
    start_time: 1682067600000,
    end_time: 1682269200000,
    user_given_name: null
  },
  {
    id: 11,
    sale_id: 11963,
    address: '14744 NW Forestel Loop Beaverton  OR 97006',
    follower_email: 'benwaples@gmail.com',
    start_time: 1682071200000,
    end_time: 1682262000000,
    user_given_name: null
  }
]
sending email to:  benwaples@gmail.com
sending email to:  benwaples@gmail.com
sending email to:  benwaples@gmail.com
sending email to:  benwaples@gmail.com
sending email to:  benwaples@gmail.com
sending email to:  benwaples@gmail.com
sending email to:  benwaples@gmail.com
updatedFollowedSales [
  {
    follower_email: 'benwaples@gmail.com',
    address: 'Not Posted - Region: SW Portland'
  },
  {
    follower_email: 'benwaples@gmail.com',
    address: '21507 Highway 99E NE Aurora  OR 97002'
  },
  {
    follower_email: 'benwaples@gmail.com',
    address: 'Not Posted - Region: SW Portland'
  },
  {
    follower_email: 'benwaples@gmail.com',
    address: 'Not Posted - Region: SW Portland'
  },
  {
    follower_email: 'benwaples@gmail.com',
    address: '35513 NE 119th Avenue  La Center  WA 98629'
  },
  {
    follower_email: 'benwaples@gmail.com',
    address: '2106 NE Village Green Drive Vancouver  WA 98684'
  },
  {
    follower_email: 'benwaples@gmail.com',
    address: '14744 NW Forestel Loop Beaverton  OR 97006'
  }
]
checkFutureSalesScrape: 4.060s

 */