import { type FC, useCallback, useEffect, useRef, useState } from 'react';

import { Magnify } from '@components/SvgComponents';
import { MAX_NAME_LENGTH } from '@libs/consts';
import type { UserSmall } from '@libs/types/rust';
import { getSearchResults } from '@services/search';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { useRouter } from 'next/router';
import { useOnClickOutside } from 'usehooks-ts';

import Results from './Results';

import styles from './styles.module.scss';

type Props = {
  className?: string;
};

const SearchBar: FC<Props> = ({ className }) => {
  const router = useRouter();
  const containerRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<UserSmall[] | undefined>();
  const [showResults, setShowResults] = useState(false);

  useOnClickOutside(containerRef, () => setShowResults(false));

  // Close search results when navigating to a new page
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation above>
  useEffect(() => {
    setShowResults(false);
  }, [router.asPath]);

  const searchUser = useCallback((query: string) => {
    if (!query) {
      setResults([]);
      setShowResults(false);
      return;
    }

    getSearchResults(query)
      .then((res) => {
        // Show max 5 results
        setShowResults(true);
        setResults(res.slice(0, 5));
      })
      .catch(() => {
        setResults([]);
        setShowResults(false);
      });
  }, []);

  // keeping the debounce time a little longer for search
  // because it's 4 separate osu api requests for each query
  const debouncedSearch = AwesomeDebouncePromise(searchUser, 600);

  const handleChange = (query: string) => {
    // TODO: Display loading indicator

    debouncedSearch(query);
  };

  const wrapperClass = `${styles.searchBorder} ${className}`;

  return (
    <div className={wrapperClass} ref={containerRef}>
      <div className={styles.searchBar}>
        <input
          onChange={(e) => handleChange(e.target.value)}
          placeholder={'Search User'}
          maxLength={MAX_NAME_LENGTH}
          ref={inputRef}
        />
        <button className={styles.magnifyButton}>
          <Magnify className={styles.magnifySvg} />
        </button>
      </div>
      {showResults && <Results results={results || []} />}
    </div>
  );
};

export default SearchBar;
