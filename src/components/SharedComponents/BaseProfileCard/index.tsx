import { type FC, useCallback } from 'react';

import { DEFAULT_AVATAR } from '@libs/consts';
import type { UserSmall } from '@libs/types/rust';
import { getUserBio, useCurrentUser } from '@services/user';
import { useGlobalTooltip } from '@states/globalTooltip';
import { useQueryClient } from '@tanstack/react-query';

import ConditionalLink from '../ConditionalLink';
import Badge from './Badge';

import styles from './style.module.scss';

type Props = {
  className?: string;
  userData?: UserSmall;
  forceLoading?: boolean;
};

const BaseProfileCard: FC<Props> = ({ className = '', userData }) => {
  const queryClient = useQueryClient();

  const tooltipProps = useGlobalTooltip((state) => state.tooltipProps);
  const activateTooltip = useGlobalTooltip((state) => state.activateTooltip);
  const deactivateTooltip = useGlobalTooltip(
    (state) => state.deactivateTooltip,
  );

  const { data: currentUser } = useCurrentUser();

  const prefetchUserBio = useCallback(() => {
    if (!userData?.id || currentUser) return;
    queryClient.prefetchQuery({
      queryKey: ['userBio', userData?.id.toString()],
      queryFn: () => getUserBio(userData?.id),
    });
  }, [userData?.id, queryClient.prefetchQuery, currentUser]);

  if (!userData) {
    return (
      <div className={`${styles.skeleton} ${styles.cardWrapper} ${className}`}>
        <div className={`${styles.photoCell}`} />
        <div className={`${styles.name}`} />
        <div className={`${styles.influencedStat}`} />
        <div className={`${styles.rankedStat}`} />
      </div>
    );
  }

  const displayFlag = userData.country_code !== 'XX';
  const influenceText = userData.mentions ?? '...';
  const userGroups = userData.groups;

  return (
    <ConditionalLink
      disabled={!userData || !currentUser}
      href={`/profile/${userData.id}`}
      onMouseEnter={prefetchUserBio}
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
          src={userData.avatar_url || DEFAULT_AVATAR}
          alt={`${userData.username} avatar`}
          className={styles.photo}
        />
        {!!userGroups?.length && (
          <div className={styles.badges}>
            {userGroups.map((group) => (
              <Badge key={group.short_name} group={group} />
            ))}
          </div>
        )}
      </div>
      <div className={styles.name}>{userData.username}</div>
      <div className={styles.influencedStat}>
        Mentioned In <span>{influenceText}</span>
      </div>
      <div className={styles.rankedStat}>
        Ranked Maps {userData && <span>{userData.ranked_maps}</span>}
      </div>
      {displayFlag && (
        <div className={styles.flag} {...tooltipProps(userData.country_name)}>
          <img
            alt={`${userData.username} is from ${userData.country_name}`}
            src={`https://flagcdn.com/${userData.country_code.toLowerCase()}.svg`}
          />
        </div>
      )}
    </ConditionalLink>
  );
};

export default BaseProfileCard;
