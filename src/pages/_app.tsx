import Head from 'next/head';
import type { AppProps } from 'next/app';
import { SessionProvider } from "next-auth/react";
import { useEffect } from 'react';
import '@/styles/globals.css';
import useFavicon from '@/hooks/useFavicon';


export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const favicon = useFavicon();

  useEffect(() => {
    const documentHeight = () => {
      const doc = document.documentElement;
      doc.style.setProperty('--doc-height', `${window.innerHeight}px`);
    };
    window.addEventListener('resize', documentHeight);
    documentHeight();
    return () => {
      window.removeEventListener('resize', documentHeight);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Estate Sale Trackr</title>
        <meta name="description" content="wewa created this" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={favicon} />
      </Head>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
}
