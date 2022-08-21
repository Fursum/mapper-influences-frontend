import { FC, useMemo } from "react";
import BaseProfileCard from "@components/SharedComponents/BaseProfileCard";
import { userData } from "@libs/consts/dummyUserData";

import styles from "./style.module.scss";
import NewsRow from "./NewsRow";
import { LeaderboardType, NewsType } from "..";

type Props = {
  newsList: NewsType[];
  topList: LeaderboardType[];
};
const NewsScreen: FC<Props> = ({ newsList, topList }) => {
  return (
    <div className={styles.newsScreen}>
      <div className={styles.topInfluencers}>
        <h2>Top Influencers</h2>
        {topList.map((rowData) => (
          <div key={rowData.user.id} className={styles.row}>
            <BaseProfileCard userData={rowData.user} />
            <div className={styles.number}>
              {rowData.number}
              <span>{`Mention${rowData.number !== 1 ? "s" : ""}`}</span>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.newsContainer}>
        <h2>Latest News</h2>
        {newsList.map((item, index) => (
          <NewsRow key={index} {...item} />
        ))}
      </div>
    </div>
  );
};
export default NewsScreen;
