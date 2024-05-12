import { useFullUser } from "@services/user";
import { useGlobalTooltip } from "@states/globalTooltip";
import {
  type FC,
  type MouseEventHandler,
  type ReactNode,
  useMemo,
} from "react";

import styles from "./style.module.scss";

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

  const { data: profileData, isLoading } = {}; //useFullUser(userId);

  const {
    ranked_count = 0,
    nominated_count = 0,
    guest_count = 0,
    loved_count = 0,
    graveyard_count = 0,
  } = profileData || {};

  const rankedTooltip = useMemo(() => {
    const tooltip: string[] = [];
    if (ranked_count && ranked_count > 0)
      tooltip.push(`${ranked_count} ranked`);
    if (nominated_count && nominated_count > 0)
      tooltip.push(`${nominated_count} nominated`);
    if (guest_count && guest_count > 0)
      tooltip.push(`${guest_count} guest diff`);
    return tooltip.join(", ");
  }, [profileData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`${styles.wrapper} ${isLoading ? styles.loading : ""}`}>
      <SingleStat
        count={ranked_count + nominated_count + guest_count}
        onMouseEnter={(e) =>
          rankedTooltip && activateTooltip(rankedTooltip, e.currentTarget)
        }
        onMouseLeave={() => deactivateTooltip()}
      >
        Ranked
      </SingleStat>
      <SingleStat count={loved_count}>Loved</SingleStat>
      <SingleStat count={graveyard_count}>Pending</SingleStat>
      <SingleStat count={graveyard_count}>Graved</SingleStat>
    </div>
  );
};

export default MapStats;
