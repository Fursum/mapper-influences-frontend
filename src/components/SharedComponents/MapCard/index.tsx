import { type FC, useState } from 'react';

import {
  CatchIcon,
  ManiaIcon,
  OsuIcon,
  TaikoIcon,
} from '@components/SvgComponents/ModeIcons';
import type { BeatmapId } from '@services/influence';
import { useMapData } from '@services/maps';
import { useGlobalTooltip } from '@states/globalTooltip';

import ProfilePhoto from '../ProfilePhoto';

import styles from './style.module.scss';

const MapCard: FC<{
  map?: BeatmapId;
  deleteFn?: (map: BeatmapId) => void;
  loading?: boolean;
}> = ({ map, deleteFn, loading }) => {
  const { activateTooltip } = useGlobalTooltip();
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  const { data: mapData } = useMapData(
    map?.id,
    map?.is_beatmapset ? 'set' : 'diff',
  );

  if (!mapData || !map?.id) return <></>;

  const diff = !map.is_beatmapset
    ? mapData.beatmaps?.find((b) => b.id === Number(map.id))
    : undefined;

  const setUrl = `https://osu.ppy.sh/beatmapsets/${map.id}`;
  const diffUrl = `https://osu.ppy.sh/beatmaps/${map.id}`;

  const mapUrl = map.is_beatmapset ? setUrl : diffUrl;

  const mapOwner = mapData.creator;
  const ownerAvatar = mapData.related_users.find(
    (user) => user.username === mapOwner,
  )?.avatar_url;
  const canDelete = !!deleteFn;

  return (
    <a
      href={mapUrl}
      target={'_blank'}
      rel="noreferrer"
      style={{
        backgroundImage: `url(${mapData.covers.cover})`,
        // only allow hover if loading
        pointerEvents: loading ? 'none' : 'auto',
      }}
      className={styles.card}
    >
      <div className={styles.songInfo}>
        <div className={styles.title}>{mapData.title}</div>
        <div className={styles.artist}>{mapData.artist}</div>
      </div>

      {diff && (
        <div className={styles.diff}>
          <ModeIcon mode={diff?.mode} />
          {diff.version}
        </div>
      )}
      <ProfilePhoto
        className={styles.ownerAvatar}
        photoUrl={ownerAvatar}
        size="md"
        circle
        parentProps={{
          onMouseEnter: (e) => activateTooltip(mapOwner, e.currentTarget),
        }}
      />
      {canDelete && (
        <button
          className={`danger ${styles.delete}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!deleteConfirmation) {
              setDeleteConfirmation(true);
              setTimeout(() => setDeleteConfirmation(false), 3000);
            } else deleteFn(map);
          }}
        >
          x
        </button>
      )}
      {deleteConfirmation && (
        <div className={styles.confirmation}>
          <span>Are you sure?</span>
        </div>
      )}
      {loading && <div className={styles.loading} />}
    </a>
  );
};

export default MapCard;

export const ModeIcon = ({
  mode,
  color,
}: {
  mode?: string;
  color?: string;
}) => {
  switch (mode) {
    case 'osu':
      return <OsuIcon color={color || 'var(--white)'} />;
    case 'taiko':
      return <TaikoIcon color={color || 'var(--white)'} />;
    case 'fruits':
      return <CatchIcon color={color || 'var(--white)'} />;
    case 'mania':
      return <ManiaIcon color={color || 'var(--white)'} />;
    default:
      return <></>;
  }
};
