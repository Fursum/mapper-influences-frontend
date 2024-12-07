import { type FC, useMemo, useState } from 'react';

import {
  CatchIcon,
  ManiaIcon,
  OsuIcon,
  TaikoIcon,
} from '@components/SvgComponents/ModeIcons';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getDiffColor } from '@libs/functions/colors';
import type { BeatmapSearch, BeatmapSmall } from '@libs/types/rust';
import { useGlobalTooltip } from '@states/globalTooltip';

import ProfilePhoto from '../ProfilePhoto';

import styles from './style.module.scss';

const MapCard: FC<{
  map?: Pick<
    BeatmapSmall,
    | 'id'
    | 'user_id'
    | 'cover'
    | 'title'
    | 'artist'
    | 'user_avatar_url'
    | 'user_name'
  > & {
    /** If its a set, this will exist */
    beatmaps?: BeatmapSearch['beatmaps'];
  };
  deleteFn?: (id: string | number) => void;
  loading?: boolean;
}> = ({ map, deleteFn, loading }) => {
  const isSet = map && 'beatmaps' in map;

  const tooltipProps = useGlobalTooltip((state) => state.tooltipProps);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  const diff = !isSet
    ? map?.beatmaps?.find((b) => b.id === Number(map?.id))
    : undefined;

  const diffColor = useMemo(
    () =>
      diff?.difficulty_rating
        ? getDiffColor(diff.difficulty_rating)
        : undefined,
    [diff?.difficulty_rating],
  );

  if (!map || !map?.id)
    return (
      <div className={`${styles.skeleton}`}>
        <div className={styles.title} />
        <div className={styles.artist} />
        <div className={styles.ownerAvatar} />
      </div>
    );

  const setUrl = `https://osu.ppy.sh/beatmapsets/${map.id}`;
  const diffUrl = `https://osu.ppy.sh/beatmaps/${map.id}`;

  const mapUrl = isSet ? setUrl : diffUrl;

  const canDelete = !!deleteFn;

  return (
    <a
      href={mapUrl}
      target={'_blank'}
      rel="noreferrer"
      style={{
        // only allow hover if loading
        pointerEvents: loading ? 'none' : 'auto',
      }}
      className={styles.card}
    >
      <img src={map.cover} alt="cover" loading="lazy" />
      <div className={styles.songInfo}>
        <div className={styles.title}>{map.title}</div>
        <div className={styles.artist}>{map.artist}</div>
      </div>

      {diff && (
        <div className={styles.diff}>
          <ModeIcon
            mode={diff?.mode}
            color={diffColor}
            {...tooltipProps(`${diff.difficulty_rating}*`)}
          />
          {diff.version}
        </div>
      )}
      <ProfilePhoto
        className={styles.ownerAvatar}
        photoUrl={map?.user_avatar_url}
        size="md"
        circle
        parentProps={
          map?.user_name
            ? {
                ...tooltipProps(map?.user_name),
              }
            : {}
        }
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
            } else deleteFn(map.id);
          }}
        >
          <FontAwesomeIcon icon={faTrashAlt} size="1x" />
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
  onMouseEnter,
  onMouseLeave,
}: {
  mode?: string;
  color?: string;
  onMouseEnter?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  onMouseLeave?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
}) => {
  let Component = OsuIcon;
  switch (mode) {
    case 'osu':
      Component = OsuIcon;
      break;
    case 'taiko':
      Component = TaikoIcon;
      break;
    case 'fruits':
      Component = CatchIcon;
      break;
    case 'mania':
      Component = ManiaIcon;
      break;
  }

  return (
    <Component
      color={color || 'var(--white)'}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};
