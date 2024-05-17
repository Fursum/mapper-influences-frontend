import { useGlobalTooltip } from "@states/globalTooltip";
import Link from "next/link";
import type { FC } from "react";
import styles from "./style.module.scss";

type Props = { userId?: string | number; className?: string };

const BaseProfileCard: FC<Props> = ({ userId, className = "" }) => {
  const { activateTooltip, deactivateTooltip } = useGlobalTooltip();
  const { data: userData, isLoading } = {}; //useBaseUser(userId);

  /*
  const badges = userData.groups?.map((group) => (
    <Badge key={group.id} group={group} />
  ));
  */
  const badges = [];

  if (isLoading) {
    return (
      <div className={`${styles.skeleton} ${styles.cardWrapper} ${className}`}>
        <div className={`${styles.photoCell}`} />
        <div className={`${styles.name}`} />
        <div className={`${styles.influencedStat}`} />
        <div className={`${styles.rankedStat}`} />
      </div>
    );
  }

  return (
    <Link
      href={`/profile/${userData?.id}`}
      onClick={deactivateTooltip}
      className={`${styles.cardWrapper} ${className}`}
    >
      <div className={styles.backgroundFill} />
      <div className={`${styles.photoCell}`}>
        <img
          src={userData?.profile_picture}
          alt="Profile photo"
          className={styles.photo}
        />
        {!!badges?.length && <div className={styles.badges}>{""}</div>}
      </div>
      <div className={styles.name}>{userData?.user_name}</div>
      <div className={styles.influencedStat}>
        Influenced <span>1</span>
      </div>
      <div className={styles.rankedStat}>
        Ranked Maps <span>15</span>
      </div>
      {userData?.flag && (
        <div
          className={styles.flag}
          onMouseEnter={(e) =>
            userData.flag &&
            activateTooltip(userData.flag.name, e.currentTarget)
          }
        >
          <img
            alt={`${userData.user_name} is from ${userData.flag.name}`}
            src={`https://flagcdn.com/${userData.flag.code.toLowerCase()}.svg`}
          />
        </div>
      )}
    </Link>
  );
};

export default BaseProfileCard;
