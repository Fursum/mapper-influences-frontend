import type { ComponentProps, FC } from 'react';

import type { LeaderboardResponse } from '@services/leaderboard';
import { useFullUser } from '@services/user';
import { useGlobalTooltip } from '@states/globalTooltip';
import Link from 'next/link';

import Badge from './Badge';

import styles from './style.module.scss';

type Props = {
  userId?: string | number;
  className?: string;
  offlineData?: LeaderboardResponse[number];
};

const BaseProfileCard: FC<Props> = ({
  userId,
  className = '',
  offlineData,
}) => {
  const { activateTooltip, deactivateTooltip } = useGlobalTooltip();
  const { data: userData, isLoading } = useFullUser(userId?.toString());

  const userGroups = userData?.groups;

  if ((isLoading || !userId) && !offlineData) {
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
    <ConditionalLink
      disabled={!userData}
      href={`${userData ? `/profile/${userData?.id}` : '/'}`}
      onClick={
        userData
          ? deactivateTooltip
          : () => {
              activateTooltip('Log in to see their profile!', {} as any);
              setTimeout(deactivateTooltip, 3000);
            }
      }
      className={`${styles.cardWrapper} ${className}`}
    >
      <div className={styles.backgroundFill} />
      <div className={`${styles.photoCell}`}>
        <img
          src={
            userData?.avatar_url ||
            offlineData?.avatar_url ||
            '/images/default_avatar.png'
          }
          alt={`${userData?.username || offlineData?.avatar_url} avatar`}
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
      <div className={styles.name}>
        {userData?.username || offlineData?.username}
      </div>
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
        {userData && (
          <span>
            {(userData?.ranked_and_approved_beatmapset_count || 0) +
              (userData?.guest_beatmapset_count || 0)}
          </span>
        )}
        {!userData && offlineData && (
          <span
            onMouseEnter={(e) =>
              activateTooltip(
                'Log in to see more information!',
                e.currentTarget,
              )
            }
          >
            ...
          </span>
        )}
      </div>
      {(userData?.country || offlineData?.country) && (
        <div
          className={styles.flag}
          onMouseEnter={(e) =>
            userData?.country &&
            activateTooltip(userData.country.name, e.currentTarget)
          }
        >
          <img
            alt={`${userData?.username || offlineData?.username} is from ${userData?.country.name || offlineData?.country}`}
            src={`https://flagcdn.com/${userData?.country.code.toLowerCase() || offlineData?.country.toLowerCase()}.svg`}
          />
        </div>
      )}
    </ConditionalLink>
  );
};

export default BaseProfileCard;

const ConditionalLink: FC<
  ComponentProps<typeof Link> & {
    disabled?: boolean;
  }
> = ({ href, children, disabled, ...props }) => {
  if (disabled) return <div {...(props as any)}>{children}</div>;
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
};
