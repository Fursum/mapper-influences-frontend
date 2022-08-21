import { userData } from "@libs/consts/dummyUserData";
import { UserBase } from "@libs/types/user";
import { FC, useMemo } from "react";
import LoginScreen from "./LoginScreen";
import NewsScreen from "./NewsScreen";
import TutorialScreen from "./TutorialScreen";

const exampleMarkdown = "**Test1** *test2* test3 ~~test4~~";
const exampleNews = [
  {
    fullText: exampleMarkdown,
    title: "News Title",
    type: "Update Type",
    desc: "Short description",
  },
];

export type NewsType = {
  fullText: string;
  title: string;
  type: string;
  desc: string;
};

export type LeaderboardType = {
  user: UserBase;
  number: number;
};

type Props = {};
const HomeScreen: FC = ({}) => {
  const session = true;
  const showTutorial = false;

  const exampleTopList = useMemo(
    () =>
      userData.influences
        .map((influence, index) => ({
          user: influence.profileData,
          number: index * 25,
        }))
        .sort((a, b) => b.number - a.number),
    []
  );

  const UserScreen = showTutorial ? TutorialScreen : NewsScreen;
  return !session ? (
    <LoginScreen />
  ) : (
    <UserScreen newsList={exampleNews} topList={exampleTopList} />
  );
};

export default HomeScreen;
