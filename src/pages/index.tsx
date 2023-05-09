import { useEffect, useState } from 'react';
import Router, { useRouter } from 'next/router';


function Home() {

  const { pathname } = useRouter();

  useEffect(() => {
    if (!pathname.includes('map') && !pathname.includes('list')) {
      Router.push('/map');
    }
  }, [pathname]);

  return (
    <>
    </>
  );
}

export default Home;
