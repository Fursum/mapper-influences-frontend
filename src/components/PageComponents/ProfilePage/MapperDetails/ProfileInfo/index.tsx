import ProfilePhoto from "@components/SharedComponents/ProfilePhoto";
import { osuBaseUrl } from "@libs/consts/urls";
import { useGetInfluences } from "@services/influence";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import { type FC, useEffect, useMemo, useRef } from "react";

import AddUserButton from "../AddUserButton";
const textFit = require("textfit");

import styles from "./style.module.scss";
import { useFullUser } from "@hooks/useUser";

type Props = {
  userId?: string | number;
};

const ProfileInfo: FC<Props> = ({ userId }) => {
  const ownProfile = !userId;

  const { data: osuData, isLoading } = useFullUser(userId?.toString());
  const { data: currentUserInfluences } = useGetInfluences();

  const profileData = {} as any;

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
  }, [profileData]);

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
          <div className={styles.mapperName} ref={nameRef} />
          <div className={styles.title} />
          {!ownProfile && <div className={styles.addUser} />}
        </div>
      </div>
    );

  return (
    <div className={styles.profileInfo}>
      <a
        href={`${osuBaseUrl}users/${osuData?.id}`}
        target="_blank"
        rel="noreferrer"
      >
        <ProfilePhoto
          photoUrl={osuData?.avatar_url}
          loading={isLoading}
          size="xl"
          circle
          className={styles.avatar}
        />
      </a>
      <div className={styles.rightSide}>
        <a
          href={`${osuBaseUrl}users/${osuData?.id}`}
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.mapperName} ref={nameRef}>
            {osuData?.username}
          </div>
        </a>
        {/* <UserGroup /> */}
        {!ownProfile && (
          <AddUserButton
            userId={userId}
            action={isAlreadyAdded ? "remove" : "add"}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
