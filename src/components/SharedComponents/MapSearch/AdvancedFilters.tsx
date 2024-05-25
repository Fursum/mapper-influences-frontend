import { type FC, useState } from 'react';

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

  const { data: mapData, isLoading } = useMapData(difficultyId, 'diff');

  return (
    <>
      <div className={styles.filters}>
        <h4>Mode</h4>
        {MODES.map((mode) => (
          <button
            key={mode}
            onClick={() => {
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
            key={status}
            onClick={() => {
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
            key={genre.name}
            onClick={() => {
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
            key={language.name}
            onClick={() => {
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
          disabled={!mapData || isLoading}
          onClick={(e) => {
            e.preventDefault();
            toggleMap(Number(difficultyId));
          }}
          role="button"
        >
          {selectedMaps.includes(Number(difficultyId)) ? '-' : '+'}
        </button>
      </label>
      {mapData && difficultyId && (
        <div className={styles.mapPreview}>
          <MapCard
            map={{
              id: difficultyId ? Number(difficultyId) : 0,
              is_beatmapset: false,
            }}
          />
        </div>
      )}
    </>
  );
};

export default AdvancedFilters;
