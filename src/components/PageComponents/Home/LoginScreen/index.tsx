import DarkModeToggle from "@components/Layout/Header/DarkModeToggle";
import { LeaderboardType, NewsType } from "@libs/types/influence";
import { useRouter } from "next/router";
import { FC } from "react";
import { useAppDispatch } from "src/redux/hooks";
import { SessionActions } from "src/redux/Slices/session";
import ContributeButtons from "../Shared/ContributeButtons";
import Leaderboard from "../Shared/Leaderboard";
import News from "../Shared/News";
import CoolCards from "./3dCards";

import styles from "./style.module.scss";

type Props = { newsList: NewsType[]; topList: LeaderboardType[] };
const LoginScreen: FC<Props> = ({ topList, newsList }) => {
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
    <div className={styles.content}>
      <DarkModeToggle />
      <div className={styles.title}>
        <span>Welcome to</span>
        <h1>Mapper Influences</h1>
      </div>
      <section className={styles.loginText}>
        <h4>Most features are locked to guests.</h4>
        <h4>To continue, {LoginButton}</h4>
      </section>

      <section>
        <h2>What is this site?</h2>
        <p>
          This site is meant to be a more interactive version of{" "}
          <a
            href="https://pishifat.github.io/"
            target={"_blank"}
            rel={"noreferrer"}
          >
            pishifat’s Mapper Influences
            <span className={styles.tooltip}>Opens in new tab</span>
          </a>{" "}
          project.
          <br />
          Naming is a coincidence though.
        </p>
      </section>
      <section className={styles.widerSection}>
        <h2>Cool, what are the features?</h2>
        <p>
          The main function of this site is to add other mappers to your
          profile. You can then give additional details on how they affected
          you.
          <br />
          There is also a leaderboard of top influencers down below.
        </p>
      </section>

      <section className={styles.fullSection}>
        <Leaderboard topList={topList} />
        <News newsList={newsList} className={styles.news} />
      </section>

      <ContributeButtons />

      <div className={styles.coolCards}>
        <CoolCards />
      </div>
    </div>
  );
};
export default LoginScreen;
