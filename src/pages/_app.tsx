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
        <link rel="icon" href="/svg/Influences.svg" />
        <link rel="shortcut icon" href="/svg/Influences.svg" />
        <link rel="mask-icon" href="/svg/Influences.svg" color="#000000" />
        <title>Mapper Influences</title>
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
