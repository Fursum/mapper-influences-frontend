import { UserDetails } from "@libs/types/user";
import { FC } from "react";

import styles from "../profilePage.module.scss";

type Props = {
  details: UserDetails;
};

const Stats: FC<Props> = ({ details }) => {
  return (
    <div className={styles.stats}>
      <span>Followers: {details.followerCount}</span>
      <span>Subscribers: {details.subCount}</span>
      <span>Ranked Maps: {details.rankedCount}</span>
      <span>Loved Maps: {details.lovedCount}</span>
      <span>Pending Maps: {details.pendingCount}</span>
      <span>Graved Maps: {details.graveyardCount}</span>
    </div>
  );
};

export default Stats;
