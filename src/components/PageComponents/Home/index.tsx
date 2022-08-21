import { FC } from "react";
import LoginScreen from "./LoginScreen";
import NewsScreen from "./NewsScreen";
import TutorialScreen from "./TutorialScreen";

type Props = {};
const HomeScreen: FC = ({}) => {
  const session = true;
  const showTutorial = false;

  const UserScreen = showTutorial ? TutorialScreen : NewsScreen;
  return !session ? <LoginScreen /> : <UserScreen />;
};

export default HomeScreen;
