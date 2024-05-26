import { type FC, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import { getDiffColor } from '@libs/functions/colors';
import type { BeatmapResponse } from '@libs/types/IOsuApi';
import { useGlobalTooltip } from '@states/globalTooltip';
import cx from 'classnames';

import MapCard, { ModeIcon } from '../MapCard';

import styles from './style.module.scss';

const SearchResults: FC<{
  results?: BeatmapResponse[];
  selectedMaps: number[];
  toggleMap: (id: number) => void;
  disabled?: boolean;
}> = ({ results, selectedMaps, toggleMap, disabled }) => {
  const activateTooltip = useGlobalTooltip((state) => state.activateTooltip);

  const parentRef = useRef<HTMLDivElement>(null);

  const [visibleResults, setVisibleResults] = useState<BeatmapResponse[]>([]);

  useEffect(() => {
    if (results?.length) {
      setVisibleResults(results.slice(0, 5));
    }

    // Scroll up when new results are loaded
    if (parentRef.current) {
      parentRef.current.scrollTop = 0;
    }
  }, [results]);

  if (!results?.length) return <></>;

  return (
    <div className={styles.results} ref={parentRef}>
      <InfiniteScroll
        initialLoad={true}
        loadMore={() => {
          setVisibleResults(results.slice(0, visibleResults.length + 5));
        }}
        hasMore={results.length > visibleResults.length}
        useWindow={false}
        getScrollParent={() => parentRef.current}
        key={selectedMaps.join(',') + String(disabled)}
      >
        {visibleResults.map((map) => (
          <div key={map.id} className={styles.row}>
            <MapCard
              map={{
                id: map.id,
                is_beatmapset: true,
              }}
            />
            <div className={styles.diffs}>
              {map.beatmaps
                .sort((a, b) => b.difficulty_rating - a.difficulty_rating)
                .map((row) => {
                  return (
                    <button
                      key={row.id}
                      className={cx({
                        [styles.selected]: selectedMaps.includes(row.id),
                        [styles.disabled]: disabled,
                      })}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleMap(row.id);
                      }}
                      disabled={!selectedMaps.includes(row.id) && disabled}
                    >
                      <ModeIcon
                        mode={row.mode}
                        color={getDiffColor(row.difficulty_rating)}
                        onMouseEnter={(e) =>
                          activateTooltip(
                            `${row.difficulty_rating}*`,
                            e.currentTarget,
                          )
                        }
                      />{' '}
                      {row.version}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default SearchResults;
