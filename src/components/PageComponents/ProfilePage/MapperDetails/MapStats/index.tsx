import {
  type FC,
  type MouseEventHandler,
  type ReactNode,
  useMemo,
} from 'react';

import { useUserBio } from '@services/user';
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
  const tooltipProps = useGlobalTooltip((state) => state.tooltipProps);

  const { data: profileData, isLoading } = useUserBio(userId?.toString());

  const {
    ranked_and_approved_beatmapset_count = 0,
    nominated_beatmapset_count = 0,
    guest_beatmapset_count = 0,
    loved_beatmapset_count = 0,
    graveyard_beatmapset_count = 0,
    pending_beatmapset_count = 0,
  } = profileData || {};

  // biome-ignore lint/correctness/useExhaustiveDependencies: <data contains the values>
  const rankedTooltip = useMemo(() => {
    const tooltip: string[] = [];
    if (ranked_and_approved_beatmapset_count)
      tooltip.push(`${ranked_and_approved_beatmapset_count} ranked`);
    if (guest_beatmapset_count) tooltip.push(`${guest_beatmapset_count} guest`);
    return tooltip.join(', ');
  }, [profileData]);

  const totalCount =
    ranked_and_approved_beatmapset_count +
    loved_beatmapset_count +
    graveyard_beatmapset_count +
    pending_beatmapset_count +
    guest_beatmapset_count;

  // biome-ignore lint/correctness/useExhaustiveDependencies: <data contains the values>
  const totalTooltip = useMemo(() => {
    const tooltip: string[] = [];
    if (graveyard_beatmapset_count)
      tooltip.push(`${graveyard_beatmapset_count} graved`);
    if (pending_beatmapset_count)
      tooltip.push(`${pending_beatmapset_count} pending`);
    return tooltip.join(', ');
  }, [profileData]);

  return (
    <div className={`${styles.wrapper} ${isLoading ? styles.loading : ''}`}>
      <SingleStat
        count={ranked_and_approved_beatmapset_count + guest_beatmapset_count}
        {...(rankedTooltip ? tooltipProps(rankedTooltip) : {})}
      >
        Ranked
      </SingleStat>
      <SingleStat count={loved_beatmapset_count}>Loved</SingleStat>
      <SingleStat count={nominated_beatmapset_count}>Nominated</SingleStat>
      <SingleStat
        count={totalCount}
        {...(totalTooltip ? tooltipProps(totalTooltip) : {})}
      >
        Total
      </SingleStat>
    </div>
  );
};

export default MapStats;
