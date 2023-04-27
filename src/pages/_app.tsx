import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from "next-auth/react";
import EstateSaleContext, { defaultEstateSaleContext } from '../context/estate-sales';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <EstateSaleContext.Provider value={defaultEstateSaleContext}>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </EstateSaleContext.Provider>
  );
}
