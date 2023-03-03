import Head from "next/head";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { CookiesProvider } from "react-cookie";
import Layout from "@components/Layout";
import "../styles/globals.scss";

function App({ Component, pageProps }: AppProps) {

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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        ></meta>
        <meta name="author" content="Fursum"></meta>
        <link rel="icon" href="/svg/Influences.svg" />
        <title>Mapper Influences</title>
      </Head>

      <CookiesProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </CookiesProvider>
    </>
  );
}

export default App;
