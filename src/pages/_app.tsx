import "../styles/globals.scss";

import Layout from "@components/Layout";
import useAuth from "@hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useState } from "react";
import { CookiesProvider } from "react-cookie";

function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      })
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
