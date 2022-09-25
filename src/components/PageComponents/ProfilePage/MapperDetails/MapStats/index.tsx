import { UserDetails } from "@libs/types/user";
import { FC } from "react";
import { ReactNode } from "react-markdown/lib/ast-to-react";

import styles from "./style.module.scss";

const SingleStat: FC<{ count: number; children: ReactNode }> = ({
  count,
  children,
}) => (
  <div className={styles.stat}>
    <div className={styles.text}>
      {children}
      <span>maps</span>
    </div>
    <div className={styles.number}>{count}</div>
  </div>
);

const MapStats: FC<{
  details: UserDetails;
}> = ({ details }) => {
  return (
    <div className={styles.wrapper}>
      <SingleStat count={details.rankedCount}>Ranked</SingleStat>
      <SingleStat count={details.lovedCount}>Loved</SingleStat>
      <SingleStat count={details.pendingCount}>Pending</SingleStat>
      <SingleStat count={details.graveyardCount}>Graved</SingleStat>
    </div>
  );
};

export default MapStats;
