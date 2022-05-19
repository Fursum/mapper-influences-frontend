import ProfilePhoto from "@components/SharedComponents/ProfilePhoto";
import React, { FC } from "react";
import { UserBase, UserDetails } from "src/types/user";

import styles from "./profilePage.module.scss";

type Props = {
  profileData: UserBase;
  description: string;
  details: UserDetails;
};

const MapperDetails: FC<Props> = ({ profileData, description, details }) => {
  return (
    <div className={styles.mapperDetails}>
      <div className={styles.profileCard}>
        <ProfilePhoto photoUrl={profileData.avatarUrl} size="lg" />
        <span className={styles.mapperName}>{profileData.username}</span>
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
