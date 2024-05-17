import type { FC } from 'react';

import {
  CatchIcon,
  ManiaIcon,
  OsuIcon,
  TaikoIcon,
} from '@components/SvgComponents/ModeIcons';
import type { BeatmapResponse } from '@libs/types/IOsuApi';

import styles from './style.module.scss';

const MapCard: FC<{ map?: BeatmapResponse; diffId?: string | number }> = ({
  map,
  diffId,
}) => {
  if (!map) return <></>;

  const diff = map.beatmaps?.find((b) => b.id === Number(diffId));

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
      <div>
        {map.artist} - {map.title}
      </div>
      {diff && (
        <div>
          <ModeIcon mode={diff?.mode} />
          {diff.version}
        </div>
      )}
      <div>{map.creator}</div>
    </a>
  );
};

export default MapCard;

const ModeIcon = ({ mode }: { mode?: string }) => {
  switch (mode) {
    case 'osu':
      return <OsuIcon />;
    case 'taiko':
      return <TaikoIcon />;
    case 'fruits':
      return <CatchIcon />;
    case 'mania':
      return <ManiaIcon />;
    default:
      return <></>;
  }
};
