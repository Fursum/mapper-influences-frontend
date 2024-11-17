import { type FC, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import BaseProfileCard from '@components/SharedComponents/BaseProfileCard';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGetUserLeaderboards } from '@services/leaderboard';
import { useFullUser } from '@services/user';
import cx from 'classnames';

import styles from './style.module.scss';

// Temporary limit until proper pagination
const MAX_LIMIT = 200;

const Leaderboard: FC<{ className?: string }> = ({ className }) => {
  const { data: osuData } = useFullUser();

  const [rankedOnly, setRankedOnly] = useState<boolean>(false);
  const [myCountry, setMyCountry] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(10);

  const scrollRef = useRef(null);

  const { data: leaderboards, isLoading } = useGetUserLeaderboards({
    ranked: rankedOnly,
    country: myCountry ? osuData?.country.code : undefined,
    limit: limit,
  });

  const [cachedLeaderboards, setCachedLeaderboards] = useState(leaderboards);

  useEffect(() => {
    if (leaderboards) setCachedLeaderboards(leaderboards);
  }, [leaderboards]);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <h2>Top Influencers</h2>
      <div className={styles.options}>
        {osuData?.country.code && (
          <button
            className={cx({ [styles.active]: myCountry })}
            onClick={() => {
              setMyCountry((old) => !old);
              setLimit(10);
            }}
          >
            My Country
          </button>
        )}
        <button
          className={cx({ [styles.active]: rankedOnly })}
          onClick={() => {
            setRankedOnly((old) => !old);
            setLimit(10);
          }}
        >
          Ranked Mappers Only
        </button>
      </div>
      <div ref={scrollRef} className={styles.list}>
        <InfiniteScroll
          initialLoad={false}
          loadMore={() => {
            if (limit < MAX_LIMIT) setLimit((old) => old + 10);
          }}
          // When the leaderboard response is less than the limit, there are no more items to load
          hasMore={leaderboards && !isLoading && limit <= leaderboards.length}
          useWindow={false}
          getScrollParent={() => scrollRef.current}
        >
          {cachedLeaderboards?.map((item) => (
            <div key={item.user.id} className={styles.row}>
              <BaseProfileCard userData={item.user} />
              <div className={styles.number}>
                <span>{item.count}</span>
                <span>{`Mention${item.count !== 1 ? 's' : ''}`}</span>
              </div>
            </div>
          ))}
          {!cachedLeaderboards?.length && isLoading && <MockList />}
          {isLoading && (
            <div className={styles.spinner}>
              <FontAwesomeIcon icon={faSpinner} />
            </div>
          )}
        </InfiniteScroll>
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
