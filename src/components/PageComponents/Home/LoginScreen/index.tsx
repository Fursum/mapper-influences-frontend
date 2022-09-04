import { useRouter } from "next/router";
import { FC } from "react";
import { useAppDispatch } from "src/redux/hooks";
import { SessionActions } from "src/redux/Slices/session";

import styles from "./style.module.scss";

type Props = {};
const LoginScreen: FC<Props> = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const handleClick = () => {
    dispatch(SessionActions.login());
  };
  const LoginButton = (
    <button className={styles.login} onClick={handleClick}>
      Log In
    </button>
  );

  return (
    <div className={styles.background}>
      <div className={styles.content}>
        <h1>
          Welcome to <b>Mapper Influences</b>
        </h1>
        <h4>You can track and share your influences here.</h4>
        <h4>You need to {LoginButton} with osu! to use the features.</h4>
      </div>
    </div>
  );
};
export default LoginScreen;
