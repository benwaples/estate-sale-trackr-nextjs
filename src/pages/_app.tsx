import Head from 'next/head';
import type { AppProps } from 'next/app';
import { SessionProvider } from "next-auth/react";
import '@/styles/globals.css';
import useFavicon from '@/hooks/useFavicon';


export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const favicon = useFavicon();

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
