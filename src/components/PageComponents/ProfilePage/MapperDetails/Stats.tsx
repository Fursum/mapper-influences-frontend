import { UserDetails } from "@libs/types/user";
import { FC } from "react";

import styles from "./style.module.scss";
import Pill from "./Pill";

type Props = {
  details: UserDetails;
};

const Stats: FC<Props> = ({ details }) => {
  return (
    <>
      <div className={styles.followers}>
        <Pill type="Followers" count={details.followerCount} />
        <Pill type="Subscribers" count={details.subCount} />
        <Pill type="Influences" count={0} />
      </div>
      <div className={styles.stats}>
        <Pill type="Ranked" count={details.rankedCount} />
        <Pill type="Loved" count={details.lovedCount} />
        <Pill type="Pending" count={details.pendingCount} />
        <Pill type="Graved" count={details.graveyardCount} />
      </div>
    </>
  );
};

export default Stats;
