import React, { FC } from "react";
import ProfilePhoto from "@components/SharedComponents/ProfilePhoto";
import { osuBaseUrl } from "@libs/consts/urls";
import { UserBase, UserDetails } from "@libs/types/user";

import styles from "./profilePage.module.scss";

type Props = {
  profileData: UserBase;
  description: string;
  details: UserDetails;
};

const MapperDetails: FC<Props> = ({ profileData, description, details }) => {
  return (
    <div className={styles.mapperDetails}>
      <a
        href={`${osuBaseUrl}profile/${profileData.id}`}
        target="_blank"
        rel="noreferrer"
      >
        <div className={styles.profileCard}>
          <ProfilePhoto photoUrl={profileData.avatarUrl} size="lg" />
          <span className={styles.mapperName}>{profileData.username}</span>
        </div>
      </a>

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
