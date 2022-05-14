import "../styles/globals.scss";
import type { AppProps } from "next/app";
import { wrapper, store } from "../redux/store";
import { Provider } from "react-redux";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="description" content="" />
        <meta name="keywords" content="" />
        <title>Next.js Template</title>
      </Head>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </>
  );
}

export default wrapper.withRedux(MyApp);
