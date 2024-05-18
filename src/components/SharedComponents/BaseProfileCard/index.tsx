import type { FC } from 'react';

import { useFullUser } from '@services/user';
import { useGlobalTooltip } from '@states/globalTooltip';
import Link from 'next/link';

import Badge from './Badge';

import styles from './style.module.scss';

type Props = { userId?: string | number; className?: string };

const BaseProfileCard: FC<Props> = ({ userId, className = '' }) => {
  const { activateTooltip, deactivateTooltip } = useGlobalTooltip();
  const { data: userData, isLoading } = useFullUser(userId?.toString());

  const userGroups = userData?.groups;

  if (isLoading || !userId) {
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
          src={userData?.avatar_url || '/images/default_avatar.png'}
          alt={`${userData?.username} avatar`}
          className={styles.photo}
        />
        {!!userGroups?.length && (
          <div className={styles.badges}>
            {userData?.groups?.map((group) => (
              <Badge key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
      <div className={styles.name}>{userData?.username}</div>
      <div className={styles.influencedStat}>
        Influenced{' '}
        <span
          onMouseEnter={(e) =>
            activateTooltip('Work in progress!', e.currentTarget)
          }
        >
          ...
        </span>
      </div>
      <div className={styles.rankedStat}>
        Ranked Maps{' '}
        <span>
          {(userData?.ranked_and_approved_beatmapset_count || 0) +
            (userData?.guest_beatmapset_count || 0)}
        </span>
      </div>
      {userData?.country && (
        <div
          className={styles.flag}
          onMouseEnter={(e) =>
            userData.country &&
            activateTooltip(userData.country.name, e.currentTarget)
          }
        >
          <img
            alt={`${userData.username} is from ${userData.country.name}`}
            src={`https://flagcdn.com/${userData.country.code.toLowerCase()}.svg`}
          />
        </div>
      )}
    </Link>
  );
};

export default BaseProfileCard;
