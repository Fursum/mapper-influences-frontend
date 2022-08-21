import type { NextPage, GetStaticProps, InferGetStaticPropsType } from "next";
import { readFileSync } from "fs";
import { useMemo } from "react";
import {
  LoginScreen,
  NewsScreen,
  TutorialScreen,
} from "@components/PageComponents/Home";
import { userData } from "@libs/consts/dummyUserData";

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  leaderboard,
  mdFile,
  news,
}) => {
  const session = true;
  const showTutorial = false;

  const UserScreen = showTutorial ? (
    <TutorialScreen />
  ) : (
    <NewsScreen newsList={news} topList={leaderboard} />
  );
  return !session ? <LoginScreen /> : UserScreen;
};

export const getStaticProps = async () => {
  const file = readFileSync("src/libs/consts/exampleChangelog.md", "utf-8");

  const exampleNews = [
    {
      fullText: file,
      title: "News Title",
      type: "Update Type",
      desc: "Short description",
    },
  ];

  const exampleTopList = userData.influences
    .map((influence, index) => ({
      user: influence.profileData,
      number: Math.floor(Math.random() * 150),
    }))
    .sort((a, b) => b.number - a.number);

  return {
    props: {
      mdFile: file,
      news: exampleNews,
      leaderboard: exampleTopList,
    },
  };
};

export default Home;
