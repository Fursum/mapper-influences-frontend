import type { NextPage, InferGetStaticPropsType } from "next";
import { readFileSync } from "fs";
import { useState } from "react";
import {
  LoginScreen,
  NewsScreen,
  TutorialScreen,
} from "@components/PageComponents/Home";
import { userData } from "@libs/consts/dummyUserData";
import { NewsType } from "@libs/types/influence";
import { useSessionStore } from "states/user";

type SelectedScreen = "Tutorial" | "News";

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  leaderboard,
  news,
}) => {
  const [screen, setScreen] = useState<SelectedScreen>("Tutorial");
  const { user } = useSessionStore();

  if (!user) return <LoginScreen topList={leaderboard} newsList={news} />;

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

  const exampleNews: NewsType[] = [
    {
      fullText: file,
      title: "Version 1.0 is out!",
      date: new Date().toDateString(),
      desc: "Not really. This is just a placeholder.",
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
