import { FC } from "react";
import BaseProfileCard from "@components/SharedComponents/BaseProfileCard";

import { ReportBug, SendFeedback } from "./ContributeButtons";
import NewsRow from "./NewsRow";
import { LeaderboardType, NewsType } from "@libs/types/influence";

import styles from "./style.module.scss";
import CreatePost from "./CreatePost";

type Props = {
  newsList: NewsType[];
  topList: LeaderboardType[];
};
const NewsScreen: FC<Props> = ({ newsList, topList }) => {
  const isAdmin = true;

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
        {isAdmin && <CreatePost />}
        {newsList.map((item, index) => (
          <NewsRow key={index} {...item} />
        ))}
      </div>
      <div className={styles.contribute}>
        <h2>Want To Contribute?</h2>
        <div className={styles.buttons}>
          <ReportBug />
          <SendFeedback />
        </div>
      </div>
    </div>
  );
};
export default NewsScreen;
