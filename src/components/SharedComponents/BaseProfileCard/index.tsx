import type { ComponentProps, FC } from 'react';

import { DEFAULT_AVATAR } from '@libs/consts';
import type { LeaderboardResponse } from '@services/leaderboard';
import { useCurrentUser, useFullUser, useUserBio } from '@services/user';
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
  const activateTooltip = useGlobalTooltip((state) => state.activateTooltip);
  const deactivateTooltip = useGlobalTooltip(
    (state) => state.deactivateTooltip,
  );
  const { data: currentUser } = useCurrentUser();
  const { data: userData, isLoading } = useFullUser(userId?.toString());
  const { data: userBio, isLoading: bioLoading } = useUserBio(
    userId?.toString(),
  );

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

  const displayFlag =
    (userData?.country?.name || offlineData?.country) &&
    offlineData?.country !== 'XX';

  const influenceText =
    bioLoading && !offlineData?.mention_count
      ? '...'
      : userBio?.mention_count || offlineData?.mention_count || 0;

  const validId = userData?.id || offlineData?.id || userBio?.id;

  return (
    <ConditionalLink
      disabled={!currentUser}
      href={`${validId ? `/profile/${validId.toString()}` : '/'}`}
      onClick={
        !currentUser
          ? () => {
              activateTooltip('Log in to see their profile!');
              setTimeout(deactivateTooltip, 3000);
            }
          : deactivateTooltip
      }
      className={`${styles.cardWrapper} ${className}`}
    >
      <div className={styles.backgroundFill} />
      <div className={`${styles.photoCell}`}>
        <img
          src={
            userData?.avatar_url ||
            offlineData?.avatar_url ||
            userBio?.avatar_url ||
            DEFAULT_AVATAR
          }
          alt={`${userData?.username || offlineData?.avatar_url || userBio?.avatar_url} avatar`}
          className={styles.photo}
        />
        {!!userGroups?.length && (
          <div className={styles.badges}>
            {userData?.groups?.map((group) => (
              <Badge key={group.short_name} group={group} />
            ))}
          </div>
        )}
      </div>
      <div className={styles.name}>
        {userData?.username || offlineData?.username || userBio?.username}
      </div>
      <div className={styles.influencedStat}>
        Mentioned In <span>{influenceText}</span>
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
            style={{ userSelect: 'none' }}
            onMouseEnter={(e) =>
              !currentUser &&
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
      {displayFlag && (
        <div
          className={styles.flag}
          onMouseEnter={(e) =>
            userData?.country &&
            activateTooltip(userData.country?.name, e.currentTarget)
          }
        >
          <img
            alt={`${userData?.username || offlineData?.username} is from ${userData?.country.name || offlineData?.country}`}
            src={`https://flagcdn.com/${userData?.country?.code.toLowerCase() || offlineData?.country?.toLowerCase()}.svg`}
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
  // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  if (disabled) return <div {...(props as any)}>{children}</div>;
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
};
