import { type FC, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import MapCard, { ModeIcon } from '@components/SharedComponents/MapCard';
import { getDiffColor } from '@libs/functions/colors';
import type { BeatmapResponse } from '@libs/types/IOsuApi';
import { searchMaps } from '@services/search';
import { useFullUser } from '@services/user';
import { useGlobalTooltip } from '@states/globalTooltip';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

import styles from './style.module.scss';

export const AddMapModalContents: FC<{
  closeForm: () => void;
  onSubmit: (selectedDiff: number) => void;
  suggestionUserId?: number | string;
  loading: boolean;
}> = ({ closeForm, loading, onSubmit, suggestionUserId }) => {
  const activateTooltip = useGlobalTooltip((state) => state.activateTooltip);
  const { data: suggestedUser } = useFullUser(suggestionUserId?.toString());

  const [mapResults, setMapResults] = useState<BeatmapResponse[]>([]);
  const [visibleResults, setVisibleResults] = useState<BeatmapResponse[]>([]);
  const [selectedMap, setSelectedMap] = useState<number | null>(null);

  const parentRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = AwesomeDebouncePromise(searchMaps, 300);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <this is meant to only run once>
  useEffect(() => {
    if (suggestedUser) {
      searchMaps(`"${suggestedUser?.username}"`).then(setMapResults);
    }
  }, []);

  useEffect(() => {
    if (mapResults?.length) {
      setVisibleResults(mapResults.slice(0, 5));
    }

    // Scroll up when new results are loaded
    if (parentRef.current) {
      parentRef.current.scrollTop = 0;
    }
  }, [mapResults]);

  return (
    <>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedMap) onSubmit(selectedMap);
        }}
      >
        <h2>Add a map</h2>
        <label>
          <span>Search maps</span>
          <input
            onChange={(e) =>
              debouncedSearch(e.target.value).then(setMapResults)
            }
            defaultValue={`"${suggestedUser?.username}"`}
          />
        </label>
        {!!suggestedUser?.previous_usernames.length && (
          <span className={styles.previousNames}>
            Previous usernames: {suggestedUser.previous_usernames.join(', ')}
          </span>
        )}

        {!!mapResults?.length && (
          <div className={styles.results} ref={parentRef}>
            <InfiniteScroll
              initialLoad={true}
              loadMore={() => {
                setVisibleResults(
                  mapResults.slice(0, visibleResults.length + 5),
                );
              }}
              hasMore={mapResults.length > visibleResults.length}
              useWindow={false}
              getScrollParent={() => parentRef.current}
              loader={<div>...</div>}
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
                          <div
                            key={row.id}
                            className={
                              selectedMap === row.id ? styles.selected : ''
                            }
                            onClick={() => setSelectedMap(row.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setSelectedMap(row.id);
                              }
                            }}
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
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </InfiniteScroll>
          </div>
        )}

        <div className={styles.buttons}>
          <button className="cancel" role="button" onClick={closeForm}>
            Cancel
          </button>
          <button
            className="submit"
            role="button"
            disabled={loading || !selectedMap}
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>
    </>
  );
};
