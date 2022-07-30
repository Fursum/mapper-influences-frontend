import { FC } from "react";
import LoginScreen from "./LoginScreen";
import TutorialScreen from "./TutorialScreen";

type Props = {};

const HomeScreen: FC = () => {
  const session = true;

  return !session ? <LoginScreen /> : <TutorialScreen />;
};
export default HomeScreen;
