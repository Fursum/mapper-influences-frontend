import type { FC } from 'react';

import type { BeatmapResponse } from '@libs/types/IOsuApi';

import styles from './style.module.scss';

const MapCard: FC<{ map: BeatmapResponse; diffId?: string | number }> = ({
  map,
  diffId,
}) => {
  const diff = map.beatmaps.find((b) => b.id === Number(diffId));

  const mapUrl = `https://osu.ppy.sh/beatmaps/${map.id}${
    diff ? `#${diff.mode}/${diffId}` : ''
  }`;

  return (
    <a
      href={mapUrl}
      target={'_blank'}
      rel="noreferrer"
      style={{ background: `url(${map.covers.cover})` }}
      className={styles.card}
    >
      <div>{map.artist}</div>
      <div>{map.title}</div>
      {diff && <div>{diff.version}</div>}
    </a>
  );
};

export default MapCard;
