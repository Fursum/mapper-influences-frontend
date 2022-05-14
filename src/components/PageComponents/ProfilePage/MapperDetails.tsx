import ProfilePhoto from "@components/ProfilePhoto";
import React, { FC } from "react";
import { UserDetails } from "src/types/user";

import styles from "./profilePage.module.scss";

type Props = {
  name: string;
  description: string;
  details: UserDetails;
};

const MapperDetails: FC<Props> = ({ name, description, details }) => {
  return (
    <div className={styles.mapperDetails}>
      <div className={styles.profileCard}>
        <ProfilePhoto photoUrl={details.avatarUrl} size="lg" />
        <span className={styles.mapperName}>{name}</span>
      </div>
      <div className={styles.description}>{description}</div>
      <div className={styles.stats}>
        <span>Followers: {details.followerCount}</span>
        <span>Subscribers: {details.subCount}</span>
        <span>Ranked Maps: {details.rankedCount}</span>
        <span>Loved Maps: {details.lovedCount}</span>
        <span>Pending Maps: {details.pendingCount}</span>
        <span>Graved Maps: {details.graveyardCount}</span>
      </div>
    </div>
  );
};

export default MapperDetails;
