import { useState } from 'react';
import { CookiesProvider } from 'react-cookie';

import Layout from '@components/Layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import '../styles/globals.scss';

function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <>
      <Head>
        <title>Mapper Influences</title>
        <meta
          name="description"
          content="Track and share your osu! mapping influences."
        />
        <meta
          name="keywords"
          content="osu, mapping, map, beatmap, beatmaps, community, influence, style"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Fursum" />
        <meta property="og:title" content="Mapper Influences" />
        <meta
          property="og:description"
          content="Track and share your osu! mapping influences."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.mapperinfluences.com" />
        <meta
          property="og:image"
          content="https://www.mapperinfluences.com/icon-512.png"
        />
        <meta name="twitter:card" content="summary" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/svg/Influences.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="mask-icon" href="/svg/Influences.svg" color="#592060" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <CookiesProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </CookiesProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
