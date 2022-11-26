import type { NextPage, InferGetStaticPropsType } from "next";
import { readFileSync } from "fs";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { userData } from "@libs/consts/dummyUserData";
import { NewsType } from "@libs/types/influence";
import { useSessionStore } from "src/states/user";

const DynamicNewsScreen = dynamic(() =>
  import("@components/PageComponents/Home").then((r) => r.NewsScreen)
);

const DynamicTutorialScreen = dynamic(() =>
  import("@components/PageComponents/Home").then((r) => r.TutorialScreen)
);

const DynamicLoginScreen = dynamic(() =>
  import("@components/PageComponents/Home").then((r) => r.LoginScreen)
);

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  leaderboard,
  news,
}) => {
  const [screen, setScreen] = useState<"Tutorial" | "News">("Tutorial");
  const { user } = useSessionStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated || !user)
    return <DynamicLoginScreen topList={leaderboard} newsList={news} />;

  switch (screen) {
    case "News":
      return <DynamicNewsScreen newsList={news} topList={leaderboard} />;
    case "Tutorial":
      return (
        <DynamicTutorialScreen>
          <button onClick={() => setScreen("News")}>Close tutorial</button>
        </DynamicTutorialScreen>
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
