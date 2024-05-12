import ProfilePhoto from "@components/SharedComponents/ProfilePhoto";
import { osuBaseUrl } from "@libs/consts/urls";
import { useGetInfluences } from "@services/influence";
import { useFullUser } from "@services/user";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import { type FC, useEffect, useMemo, useRef } from "react";

import AddUserButton from "../AddUserButton";
const textFit = require("textfit");

import styles from "./style.module.scss";

type Props = {
  userId?: string | number;
};

const ProfileInfo: FC<Props> = ({ userId }) => {
  const ownProfile = !userId;

  const { data: profileData, isLoading } = {}; //useFullUser(userId);
  const { data: currentUserInfluences } = useGetInfluences();

  const isAlreadyAdded = useMemo(() => {
    if (!currentUserInfluences) return false;
    return currentUserInfluences.some(
      (influence) => influence.from_id.toString() === userId?.toString()
    );
  }, [currentUserInfluences, userId]);

  const nameRef = useRef(null);

  // Fit text to card on resize and on mount
  useEffect(() => {
    if (!nameRef.current) return;
    const runFitText = () => textFit(nameRef.current);
    const debounceFitText = AwesomeDebouncePromise(runFitText, 50);

    document.fonts.ready.then(() => runFitText());
    window.addEventListener("resize", debounceFitText);
    return () => {
      window.removeEventListener("resize", debounceFitText);
    };
  }, [nameRef, profileData]);

  /*
  const UserGroup = () => {
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
  */

  if (isLoading)
    return (
      <div className={`${styles.skeleton} ${styles.profileInfo}`}>
        <ProfilePhoto
          loading={true}
          size="xl"
          circle
          className={styles.avatar}
        />
        <div className={styles.rightSide}>
          <div className={styles.mapperName}></div>
          <div className={styles.title}></div>
          {!ownProfile && <div className={styles.addUser}></div>}
        </div>
      </div>
    );

  return (
    <div className={styles.profileInfo}>
      <a
        href={`${osuBaseUrl}users/${profileData?.id}`}
        target="_blank"
        rel="noreferrer"
      >
        <ProfilePhoto
          photoUrl={profileData?.profile_picture}
          loading={isLoading}
          size="xl"
          circle
          className={styles.avatar}
        />
      </a>
      <div className={styles.rightSide}>
        <a
          href={`${osuBaseUrl}users/${profileData?.id}`}
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.mapperName} ref={nameRef}>
            {profileData?.user_name}
          </div>
        </a>
        {/* <UserGroup /> */}
        {!ownProfile && (
          <AddUserButton
            userId={userId!}
            action={isAlreadyAdded ? "remove" : "add"}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
