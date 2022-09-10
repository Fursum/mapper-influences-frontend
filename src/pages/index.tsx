import type { NextPage, InferGetStaticPropsType } from "next";
import { readFileSync } from "fs";
import { useState } from "react";
import {
  LoginScreen,
  NewsScreen,
  TutorialScreen,
} from "@components/PageComponents/Home";
import { userData } from "@libs/consts/dummyUserData";
import { useAppSelector } from "src/redux/hooks";

type SelectedScreen = "Tutorial" | "News";

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  leaderboard,
  news,
}) => {
  const [screen, setScreen] = useState<SelectedScreen>("Tutorial");
  const session = useAppSelector((s) => s.session);

  if (!session) return <LoginScreen />;

  switch (screen) {
    case "News":
      return <NewsScreen newsList={news} topList={leaderboard} />;
    case "Tutorial":
      return (
        <TutorialScreen>
          <button onClick={() => setScreen("News")}>Close tutorial</button>
        </TutorialScreen>
      );
  }
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
    .map((influence) => ({
      user: influence.profileData,
      number: Math.floor(Math.random() * 150),
    }))
    .sort((a, b) => b.number - a.number);

  return {
    props: {
      news: exampleNews,
      leaderboard: exampleTopList,
    },
  };
};

export default Home;
