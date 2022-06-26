import { FC } from "react";
import LoginScreen from "./LoginScreen";

import styles from "./style.module.scss";

type Props = {};

const HomeScreen: FC = () => {
  const session = undefined;

  return (!session && <LoginScreen />);
};
export default HomeScreen;
