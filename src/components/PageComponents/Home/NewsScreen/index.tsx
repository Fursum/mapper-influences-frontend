import { FC } from "react";

import { LeaderboardType, NewsType } from "@libs/types/influence";
import Leaderboard from "../Shared/Leaderboard";

import styles from "./style.module.scss";
import News from "../Shared/News";
import ContributeButtons from "../Shared/ContributeButtons";

type Props = {
  newsList: NewsType[];
  topList: LeaderboardType[];
};
const NewsScreen: FC<Props> = ({ newsList, topList }) => {
  return (
    <div className={styles.newsScreen}>
      <div className={styles.double}>
        <Leaderboard topList={topList} className={styles.topInfluencers} />
        <News newsList={newsList} className={styles.newsContainer} />
      </div>
      <ContributeButtons className={styles.contribute} />
    </div>
  );
};
export default NewsScreen;
