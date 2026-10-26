import { type FC, useState } from 'react';

import { useMapSearch } from '@services/search';
import { useDebounceValue } from 'usehooks-ts';

import AdvancedFilters from './AdvancedFilters';
import SearchResults from './SearchResults';
import { useFilterStore } from './useFilterStore';

import styles from './style.module.scss';

export const AddMapModalContents: FC<{
  closeForm: () => void;
  onSubmit: (selectedDiffs: number[]) => void;
  mapLimit: number;
  suggestedUsername: string | undefined;
  suggestedUserPreviousNames: string[];
  loading: boolean;
}> = ({
  closeForm,
  loading,
  onSubmit,
  suggestedUsername,
  suggestedUserPreviousNames,
  mapLimit,
}) => {
  const filtersQuery = useFilterStore((state) => state.getQueryString());

  const [selectedTab, setSelectedTab] = useState<'search' | 'advanced'>(
    'search',
  );
  const [selectedMaps, setSelectedMaps] = useState<number[]>([]);
  const [searchInput, setSearchInput] = useState(
    suggestedUsername
      ? `creator:${suggestedUsername?.replaceAll(' ', '_')}`
      : '',
  );
  const [debouncedInput] = useDebounceValue(searchInput, 400);

  // Only searches on the search tab, so filter edits apply when the user
  // returns to it. react-query drops stale responses that arrive late.
  const { data: mapResults } = useMapSearch(
    debouncedInput,
    filtersQuery,
    selectedTab === 'search',
  );

  const toggleMap = (id: number) => {
    setSelectedMaps((old) => {
      if (old.includes(id)) return old.filter((i) => i !== id);

      return [...old, id];
    });
  };

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
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setSelectedTab('search');
            }}
            className={selectedTab === 'search' ? styles.active : ''}
          >
            Search
          </button>
          <button
            type="button"
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
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
          />
        </label>
        {!!suggestedUserPreviousNames.length && (
          <span className={styles.previousNames}>
            Previous usernames: {suggestedUserPreviousNames.join(', ')}
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
          <button type="button" className="cancel" onClick={closeForm}>
            Cancel
          </button>
          <span
            className={limitExceeded ? 'danger' : ''}
          >{`${selectedMaps.length} / ${mapLimit}`}</span>
          <button
            type="submit"
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
