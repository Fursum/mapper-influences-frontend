import type { NextPage } from "next";
import Head from "next/head";
import DarkModeToggle from "@components/DarkModeToggle";
import styles from "@styles/pages/Home.module.css";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Next.js Site Template</title>
        <meta name="description" content="Prepared boilerplate for Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DarkModeToggle />
    </div>
  );
};

export default Home;
