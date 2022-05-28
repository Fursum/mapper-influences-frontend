import ProfilePhoto from "@components/SharedComponents/ProfilePhoto";
import { osuBaseUrl } from "@libs/consts/urls";
import { UserBase } from "@libs/types/user";
import { FC } from "react";

import styles from "./style.module.scss";

type Props = {
  profileData: UserBase;
};

const ProfileInfo: FC<Props> = ({ profileData }) => {
  return (
    <div className={styles.profileInfo}>
      <a
        href={`${osuBaseUrl}profile/${profileData.id}`}
        target="_blank"
        rel="noreferrer"
      >
        <ProfilePhoto
          photoUrl={profileData.avatarUrl}
          size="xl"
          className={styles.avatar}
          circle
        />
      </a>
      <a
        href={`${osuBaseUrl}profile/${profileData.id}`}
        target="_blank"
        rel="noreferrer"
      >
        <div className={styles.mapperName}>{profileData.username}</div>{" "}
      </a>
      <div className={styles.title}>Nomination Assesment Team</div>
      
    </div>
  );
};

export default ProfileInfo;
