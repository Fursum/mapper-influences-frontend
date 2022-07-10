import { FC } from "react";

import styles from "./style.module.scss";

type Props = {};
const LoginScreen: FC<Props> = () => {
  return (
    <div className={styles.background}>
      <div className={styles.content}>
        <h1>
          Welcome to <b>Mapper Influences</b>
        </h1>
        <h4>You can track and share your influences here.</h4>
        <h4>
          You need to <button className={styles.login}>Log In</button> with osu! to use the features.
        </h4>
      </div>
    </div>
  );
};
export default LoginScreen;
