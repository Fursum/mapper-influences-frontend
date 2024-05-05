import DarkModeToggle from "@components/Layout/Header/DarkModeToggle";
import News from "@components/SharedComponents/News";
import type { LeaderboardType, NewsType } from "@libs/types/influence";
import type { FC } from "react";
import { useGlobalTooltip } from "src/states/globalTooltip";

import ContributeButtons from "../../../SharedComponents/ContributeButtons";
import Leaderboard from "../../../SharedComponents/Leaderboard";
import CoolCards from "./CoolCards";
import styles from "./style.module.scss";

type Props = { newsList: NewsType[]; topList: LeaderboardType[] };
const LoginScreen: FC<Props> = ({ topList, newsList }) => {
  const { activateTooltip } = useGlobalTooltip();

  const LoginButton = () => {
    const loginUrl = new URLSearchParams();

    loginUrl.append("response_type", "code");
    loginUrl.append("client_id", process.env.NEXT_PUBLIC_OSU_CLIENT_ID || "");
    loginUrl.append(
      "redirect_uri",
      process.env.NEXT_PUBLIC_OSU_REDIRECT_URI || ""
    );
    loginUrl.append("scope", "public identify");

    return (
      <a
        className={`${styles.login} ${styles.a}`}
        href={"https://osu.ppy.sh/oauth/authorize?" + loginUrl.toString()}>
        Log In
      </a>
    );
  };

  return (
    <div className={styles.content}>
      <DarkModeToggle />
      <div className={styles.title}>
        <span>Welcome to</span>
        <h1>Mapper Influences</h1>
      </div>
      <section className={styles.loginText}>
        <h4>Most features are locked to guests.</h4>
        <h4>
          To continue, <LoginButton />
        </h4>
      </section>
      <CoolCards />
      <section>
        <h2>What is this site?</h2>
        <p>
          This site is meant to be a more interactive version of{" "}
          <a
            href="https://pishifat.github.io/"
            target={"_blank"}
            rel={"noreferrer"}
            className={styles.a}
            onMouseEnter={(e) =>
              activateTooltip("Opens in new tab", e.currentTarget)
            }>
            pishifat’s Mapper Influences
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
    </div>
  );
};
export default LoginScreen;
