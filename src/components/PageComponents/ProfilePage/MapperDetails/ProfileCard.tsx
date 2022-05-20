import ProfilePhoto from "@components/SharedComponents/ProfilePhoto";
import { osuBaseUrl } from "@libs/consts/urls";
import { UserBase } from "@libs/types/user";
import { FC } from "react";

import styles from "../profilePage.module.scss";

type Props = {
  profileData: UserBase;
};

const ProfileCard: FC<Props> = ({ profileData }) => {
  return (
    <a
      href={`${osuBaseUrl}profile/${profileData.id}`}
      target="_blank"
      rel="noreferrer"
    >
      <div className={styles.profileCard}>
        <ProfilePhoto
          photoUrl={profileData.avatarUrl}
          size="lg"
          className={styles.avatar}
        />
        <div className={styles.rightSide}>
          <div className={styles.mapperName}>{profileData.username}</div>
          <div className={styles.title}>Nomination Assesment Team</div>
        </div>
      </div>
    </a>
  );
};

export default ProfileCard;
