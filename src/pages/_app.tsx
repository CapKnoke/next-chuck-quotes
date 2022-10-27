import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';

export default function App({ Component, pageProps: { session, pageProps } }: AppProps) {
  return (
    <>
      <Head>
        <meta name="color-scheme" content="dark light" />
      </Head>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
}
