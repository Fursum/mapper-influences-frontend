import { type FC, useState } from 'react';

import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMapData } from '@services/maps';
import cx from 'classnames';

import MapCard from '../MapCard';
import {
  GENRES,
  LANGUAGES,
  MODES,
  STATUSES,
  useFilterStore,
} from './useFilterStore';

import styles from './style.module.scss';

const AdvancedFilters: FC<{
  selectedMaps: number[];
  toggleMap: (id: number) => void;
}> = ({ toggleMap, selectedMaps }) => {
  const { filters, setGenre, setStatus, setMode, setLanguage } =
    useFilterStore();

  const [difficultyId, setDifficultyId] = useState<string | undefined>();

  const { data: mapData, isLoading } = useMapData(difficultyId);

  return (
    <>
      <div className={styles.filters}>
        <h4>Mode</h4>
        {MODES.map((mode) => (
          <button
            type="button"
            key={mode}
            onClick={(e) => {
              e.preventDefault();
              setMode(mode);
            }}
            className={cx({
              [styles.active]: filters.mode === mode,
            })}
          >
            {mode}
          </button>
        ))}
      </div>
      <div className={styles.filters}>
        <h4>Status</h4>
        {STATUSES.map((status) => (
          <button
            type="button"
            key={status}
            onClick={(e) => {
              e.preventDefault();
              setStatus(status);
            }}
            className={cx({
              [styles.active]: filters.status === status,
            })}
          >
            {status}
          </button>
        ))}
      </div>

      <div className={styles.filters}>
        <h4>Genre</h4>
        {GENRES.map((genre) => (
          <button
            type="button"
            key={genre.name}
            onClick={(e) => {
              e.preventDefault();
              setGenre(genre);
            }}
            className={cx({
              [styles.active]: filters.genre.name === genre.name,
            })}
          >
            {genre.name}
          </button>
        ))}
      </div>

      <div className={styles.filters}>
        <h4>Language</h4>
        {LANGUAGES.map((language) => (
          <button
            type="button"
            key={language.name}
            onClick={(e) => {
              e.preventDefault();
              setLanguage(language);
            }}
            className={cx({
              [styles.active]: filters.language.name === language.name,
            })}
          >
            {language.name}
          </button>
        ))}
      </div>

      <label>
        <span>Difficulty ID</span>
        <input
          type="number"
          placeholder="Add a map directly"
          onChange={(e) => {
            setDifficultyId(e.currentTarget.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
        />
        <button
          type="button"
          aria-label={
            selectedMaps.includes(Number(difficultyId))
              ? 'Remove map from selection'
              : 'Add map to selection'
          }
          disabled={!mapData || isLoading}
          onClick={(e) => {
            e.preventDefault();
            toggleMap(Number(difficultyId));
          }}
        >
          <FontAwesomeIcon
            icon={
              selectedMaps.includes(Number(difficultyId)) ? faMinus : faPlus
            }
          />
        </button>
      </label>
      {difficultyId && (isLoading || mapData) && (
        <div className={styles.mapPreview} aria-live="polite">
          <MapCard map={isLoading ? undefined : mapData} />
        </div>
      )}
    </>
  );
};

export default AdvancedFilters;
