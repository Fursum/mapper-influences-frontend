import { FC, useMemo } from "react";
import ProfilePhoto from "@components/SharedComponents/ProfilePhoto";
import { osuBaseUrl } from "@libs/consts/urls";
import { UserBase } from "@libs/types/user";
import AddUserButton from "../AddUserButton";

import styles from "./style.module.scss";
import { useRouter } from "next/router";

type Props = {
  profileData: UserBase;
};

const ProfileInfo: FC<Props> = ({ profileData }) => {
  const router = useRouter();
  const ownProfile = useMemo(() => {
    return router.asPath === "/profile";
  }, [router]);

  const renderGroup = () => {
    if (!profileData.groups?.length) return <></>;
    return (
      <div
        className={styles.title}
        style={{ color: profileData.groups[0].colour }}
      >
        {profileData.groups[0].name}
      </div>
    );
  };
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
      <div className={styles.rightSide}>
        <a
          href={`${osuBaseUrl}profile/${profileData.id}`}
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.mapperName}>{profileData.username}</div>
        </a>
        {renderGroup()}
        {!ownProfile && (
          <AddUserButton
            onClick={() => {
              //TODO: Add service
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
