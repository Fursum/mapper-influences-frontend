import { LoginScreen } from "@components/PageComponents/Home";
import type { NewsType } from "@libs/types/influence";
import { readFileSync } from "node:fs";
import type { InferGetStaticPropsType, NextPage } from "next";
import useAuth from "@hooks/useAuth";

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  leaderboard,
  news,
}) => {
  useAuth();

  return <LoginScreen topList={leaderboard} newsList={news} />;
};

export const getStaticProps = async () => {
  const file = readFileSync("src/libs/consts/exampleChangelog.md", "utf-8");

  const exampleNews: NewsType[] = [
    {
      fullText: file,
      title: "Version 1.0 is out!",
      date: new Date().toDateString(),
      desc: "Not really. This is just a placeholder.",
    },
  ];

  /*
  const exampleTopList = DUMMY_USER.influences
    .map((influence) => ({
      user: influence.profileData,
      number: Math.floor(Math.random() * 150),
    }))
    .sort((a, b) => b.number - a.number);
  */

  return {
    props: {
      news: exampleNews,
      leaderboard: [],
    },
  };
};

export default Home;
