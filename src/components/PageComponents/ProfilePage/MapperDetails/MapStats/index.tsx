import {
  type FC,
  type MouseEventHandler,
  type ReactNode,
  useMemo,
} from 'react';

import { useFullUser } from '@services/user';
import { useGlobalTooltip } from '@states/globalTooltip';

import styles from './style.module.scss';

const SingleStat: FC<{
  count: number;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  children: ReactNode;
}> = ({ count, children, onMouseEnter, onMouseLeave }) => (
  <div
    className={styles.stat}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <div className={styles.text}>
      {children}
      <span>maps</span>
    </div>
    <div className={styles.number}>{count}</div>
  </div>
);

const MapStats: FC<{
  userId?: string | number;
}> = ({ userId }) => {
  const { activateTooltip, deactivateTooltip } = useGlobalTooltip();

  const { data: profileData, isLoading } = useFullUser(userId?.toString());

  const {
    ranked_and_approved_beatmapset_count = 0,
    nominated_beatmapset_count = 0,
    guest_beatmapset_count = 0,
    loved_beatmapset_count = 0,
    graveyard_beatmapset_count = 0,
    pending_beatmapset_count = 0,
  } = profileData || {};

  const rankedTooltip = useMemo(() => {
    const tooltip: string[] = [];
    if (
      ranked_and_approved_beatmapset_count &&
      ranked_and_approved_beatmapset_count > 0
    )
      tooltip.push(`${ranked_and_approved_beatmapset_count} ranked`);
    if (nominated_beatmapset_count && nominated_beatmapset_count > 0)
      tooltip.push(`${nominated_beatmapset_count} nominated`);
    if (guest_beatmapset_count && guest_beatmapset_count > 0)
      tooltip.push(`${guest_beatmapset_count} guest diff`);
    return tooltip.join(', ');
  }, [profileData]);

  return (
    <div className={`${styles.wrapper} ${isLoading ? styles.loading : ''}`}>
      <SingleStat
        count={ranked_and_approved_beatmapset_count + guest_beatmapset_count}
        onMouseEnter={(e) =>
          rankedTooltip && activateTooltip(rankedTooltip, e.currentTarget)
        }
        onMouseLeave={() => deactivateTooltip()}
      >
        Ranked
      </SingleStat>
      <SingleStat count={loved_beatmapset_count}>Loved</SingleStat>
      <SingleStat count={pending_beatmapset_count}>Pending</SingleStat>
      <SingleStat count={graveyard_beatmapset_count}>Graved</SingleStat>
    </div>
  );
};

export default MapStats;
