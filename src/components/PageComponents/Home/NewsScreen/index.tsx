import { FC, useMemo } from "react";
import BaseProfileCard from "@components/SharedComponents/BaseProfileCard";
import { userData } from "@libs/consts/dummyUserData";

import styles from "./style.module.scss";

type Props = {};
const NewsScreen: FC<Props> = ({}) => {
  const exampleTopList = useMemo(
    () =>
      userData.influences
        .map((influence) => ({
          user: influence.profileData,
          number: Math.floor(Math.random() * 100),
        }))
        .sort((a, b) => b.number - a.number),
    []
  );

  return (
    <div className={styles.newsScreen}>
      <div className={styles.topInfluencers}>
        <h2>Top Influencers</h2>
        {exampleTopList.map((rowData) => (
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
      </div>
    </div>
  );
};
export default NewsScreen;
