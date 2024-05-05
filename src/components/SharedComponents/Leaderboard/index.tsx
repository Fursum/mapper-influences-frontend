import BaseProfileCard from "@components/SharedComponents/BaseProfileCard";
import type { LeaderboardType } from "@libs/types/influence";
import type { FC } from "react";

import styles from "./style.module.scss";

const Leaderboard: FC<{ topList: LeaderboardType[]; className?: string }> = ({
  topList,
  className,
}) => {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <h2>Top Influencers</h2>
      <div className={styles.list}>
        {topList.map((rowData) => (
          <div key={rowData.user.id} className={styles.row}>
            <BaseProfileCard userId={rowData.user.id} />
            <div className={styles.number}>
              <span>{rowData.number}</span>
              <span>{`Mention${rowData.number !== 1 ? "s" : ""}`}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
