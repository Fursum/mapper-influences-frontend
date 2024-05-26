import { type FC, useState } from 'react';

import BaseProfileCard from '@components/SharedComponents/BaseProfileCard';
import { useGetLeaderboards } from '@services/leaderboard';
import { useFullUser } from '@services/user';
import cx from 'classnames';

import styles from './style.module.scss';

const Leaderboard: FC<{ className?: string }> = ({ className }) => {
  const { data: osuData } = useFullUser();

  const [rankedOnly, setRankedOnly] = useState<boolean>(false);
  const [myCountry, setMyCountry] = useState<boolean>(false);

  const { data: leaderboards, isLoading } = useGetLeaderboards({
    ranked: rankedOnly,
    country: myCountry ? osuData?.country.code : undefined,
  });

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <h2>Top Influencers</h2>
      <div className={styles.options}>
        <button
          className={cx({ [styles.active]: rankedOnly })}
          onClick={() => setRankedOnly(!rankedOnly)}
        >
          Ranked Mappers Only
        </button>
        <button
          className={cx({ [styles.active]: myCountry })}
          onClick={() => setMyCountry(!myCountry)}
        >
          My Country
        </button>
      </div>
      <div className={styles.list}>
        {leaderboards?.map((user) => (
          <div key={user.id} className={styles.row}>
            <BaseProfileCard userId={user.id} offlineData={user} />
            <div className={styles.number}>
              <span>{user.mention_count}</span>
              <span>{`Mention${user.mention_count !== 1 ? 's' : ''}`}</span>
            </div>
          </div>
        ))}
        {(leaderboards?.length === 0 || isLoading) && <MockList />}
      </div>
    </div>
  );
};

export default Leaderboard;

const MockList = () => {
  return Array.from({ length: 5 }).map((_, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: <mock list>
    <div key={index} className={styles.row}>
      <BaseProfileCard />
      <div className={styles.number}>
        <span>..</span>
        <span>...</span>
      </div>
    </div>
  ));
};
