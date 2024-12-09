import { type FC, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import BaseProfileCard from '@components/SharedComponents/BaseProfileCard';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGetLeaderboards } from '@services/leaderboard';
import { useCurrentUser } from '@services/user';
import cx from 'classnames';

import MapCard from '../MapCard';

import styles from './style.module.scss';

// Temporary limit until proper pagination
const MAX_LIMIT = 200;

const Leaderboard: FC<{ className?: string; type: 'user' | 'beatmap' }> = ({
  className,
  type,
}) => {
  const { data: currentUser } = useCurrentUser();

  const [rankedOnly, setRankedOnly] = useState<boolean>(false);
  const [myCountry, setMyCountry] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(25);

  const scrollRef = useRef(null);

  const { data: leaderboards, isLoading } = useGetLeaderboards({
    ranked: rankedOnly,
    country: myCountry ? currentUser?.country_code : undefined,
    limit: limit,
    type,
  });

  // Caching to avoid entering the loading state when scrolling
  const [cachedLeaderboards, setCachedLeaderboards] = useState(leaderboards);

  useEffect(() => {
    if (leaderboards) setCachedLeaderboards(leaderboards);
  }, [leaderboards]);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <h2>Top {type === 'user' ? 'Influencers' : 'Beatmaps'}</h2>
      <div className={styles.options}>
        {currentUser?.country_code && type === 'user' && (
          <button
            className={cx({ [styles.active]: myCountry })}
            onClick={() => {
              setMyCountry((old) => !old);
              setLimit(25);
            }}
          >
            My Country
          </button>
        )}
        <button
          className={cx({ [styles.active]: rankedOnly })}
          onClick={() => {
            setRankedOnly((old) => !old);
            setLimit(25);
          }}
        >
          Ranked Mappers Only
        </button>
      </div>
      <div ref={scrollRef} className={styles.list}>
        <InfiniteScroll
          initialLoad={false}
          loadMore={() => {
            if (limit < MAX_LIMIT) setLimit((old) => old + 25);
          }}
          // When the leaderboard response is less than the limit, there are no more items to load
          hasMore={leaderboards && !isLoading && limit <= leaderboards.length}
          useWindow={false}
          getScrollParent={() => scrollRef.current}
        >
          {cachedLeaderboards?.map((item) => (
            <div key={item.user?.id || item.beatmap?.id} className={styles.row}>
              {item.user && <BaseProfileCard userData={item.user} />}
              {item.beatmap && <MapCard map={item.beatmap} />}
              <div className={styles.number}>
                <span>{item.count}</span>
                <span>{`Mention${item.count !== 1 ? 's' : ''}`}</span>
              </div>
            </div>
          ))}
          {!cachedLeaderboards?.length && isLoading && <MockList type={type} />}
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

const MockList: FC<{ type: 'user' | 'beatmap' }> = ({ type }) => {
  return Array.from({ length: 5 }).map((_, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: <mock list>
    <div key={index} className={styles.row}>
      {type === 'user' && <BaseProfileCard />}
      {type === 'beatmap' && <MapCard />}
      <div className={styles.number}>
        <span>..</span>
        <span>...</span>
      </div>
    </div>
  ));
};
