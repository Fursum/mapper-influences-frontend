import { type FC, useEffect, useState } from 'react';

import type { BeatmapSearch } from '@libs/types/rust';
import { searchMaps } from '@services/search';
import { useUserBio } from '@services/user';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

import AdvancedFilters from './AdvancedFilters';
import SearchResults from './SearchResults';
import { useFilterStore } from './useFilterStore';

import styles from './style.module.scss';

export const AddMapModalContents: FC<{
  closeForm: () => void;
  onSubmit: (selectedDiffs: number[]) => void;
  mapLimit: number;
  suggestionUserId?: number | string;
  loading: boolean;
}> = ({ closeForm, loading, onSubmit, suggestionUserId, mapLimit }) => {
  const { data: suggestedUser } = useUserBio(suggestionUserId?.toString());

  const getFiltersQuery = useFilterStore((state) => state.getQueryString);

  const [mapResults, setMapResults] = useState<BeatmapSearch[]>([]);
  const [selectedTab, setSelectedTab] = useState<'search' | 'advanced'>(
    'search',
  );
  const [selectedMaps, setSelectedMaps] = useState<number[]>([]);
  const [searchInput, setSearchInput] = useState(
    suggestedUser
      ? `creator:${suggestedUser?.username.replaceAll(' ', '_')}`
      : '',
  );

  const debouncedSearch = AwesomeDebouncePromise((query: string) => {
    searchMaps(query + getFiltersQuery()).then(setMapResults);
  }, 300);

  const toggleMap = (id: number) => {
    setSelectedMaps((old) => {
      if (old.includes(id)) return old.filter((i) => i !== id);

      return [...old, id];
    });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <This should only trigger on tab change>
  useEffect(() => {
    if (selectedTab === 'search')
      searchMaps(`${searchInput}${getFiltersQuery()}`).then(setMapResults);
  }, [selectedTab]);

  const limitExceeded = mapLimit < selectedMaps.length;

  return (
    <>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedMaps.length) onSubmit(selectedMaps);
        }}
      >
        <div className={styles.widthMaxxing} />

        <h2>Select a difficulty</h2>

        <div className={styles.tabs}>
          <button
            onClick={(e) => {
              e.preventDefault();
              setSelectedTab('search');
            }}
            className={selectedTab === 'search' ? styles.active : ''}
          >
            Search
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setSelectedTab('advanced');
            }}
            className={selectedTab === 'advanced' ? styles.active : ''}
          >
            Filters
          </button>
        </div>

        <label>
          <span>Search maps</span>
          <input
            onChange={(e) => {
              setSearchInput(e.target.value);
              debouncedSearch(e.target.value);
            }}
            defaultValue={`"${suggestedUser?.username}"`}
            value={searchInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
          />
        </label>
        {!!suggestedUser?.previous_usernames.length && (
          <span className={styles.previousNames}>
            Previous usernames: {suggestedUser.previous_usernames.join(', ')}
          </span>
        )}

        {selectedTab === 'search' && (
          <SearchResults
            selectedMaps={selectedMaps}
            toggleMap={toggleMap}
            results={mapResults}
            disabled={mapLimit <= selectedMaps.length}
          />
        )}

        {selectedTab === 'advanced' && (
          <AdvancedFilters selectedMaps={selectedMaps} toggleMap={toggleMap} />
        )}

        <div className={styles.buttons}>
          <button className="cancel" onClick={closeForm}>
            Cancel
          </button>
          <span
            className={limitExceeded ? 'danger' : ''}
          >{`${selectedMaps.length} / ${mapLimit}`}</span>
          <button
            className="submit"
            disabled={loading || !selectedMaps.length || limitExceeded}
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>
    </>
  );
};
