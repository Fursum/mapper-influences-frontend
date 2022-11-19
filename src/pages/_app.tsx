import Head from "next/head";
import type { AppProps } from "next/app";
import Layout from "@components/Layout";
import "../styles/globals.scss";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="description" content="" />
        <meta name="keywords" content="" />
        <link rel="icon" href="/svg/Influences.svg" />
        <title>Mapper Influences</title>
      </Head>

      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;
