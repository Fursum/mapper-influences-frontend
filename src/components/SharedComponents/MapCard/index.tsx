import type { FC } from 'react';

import {
  CatchIcon,
  ManiaIcon,
  OsuIcon,
  TaikoIcon,
} from '@components/SvgComponents/ModeIcons';
import type { BeatmapResponse } from '@libs/types/IOsuApi';
import { useGlobalTooltip } from '@states/globalTooltip';

import ProfilePhoto from '../ProfilePhoto';

import styles from './style.module.scss';

const MapCard: FC<{ map?: BeatmapResponse; diffId?: string | number }> = ({
  map,
  diffId,
}) => {
  const { activateTooltip } = useGlobalTooltip();

  if (!map) return <></>;

  const diff = map.beatmaps?.find((b) => b.id === Number(diffId));

  const mapUrl = `https://osu.ppy.sh/beatmaps/${map.id}${
    diff ? `#${diff.mode}/${diffId}` : ''
  }`;

  const mapOwner = map.creator;
  const ownerAvatar = map.related_users.find(
    (user) => user.username === mapOwner,
  )?.avatar_url;

  return (
    <a
      href={mapUrl}
      target={'_blank'}
      rel="noreferrer"
      style={{ background: `url(${map.covers.cover})` }}
      className={styles.card}
    >
      <div className={styles.songInfo}>
        <div className={styles.title}>{map.title}</div>
        <div className={styles.artist}>{map.artist}</div>
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
    </a>
  );
};

export default MapCard;

const ModeIcon = ({ mode }: { mode?: string }) => {
  switch (mode) {
    case 'osu':
      return <OsuIcon color="var(--white)" />;
    case 'taiko':
      return <TaikoIcon color="var(--white)" />;
    case 'fruits':
      return <CatchIcon color="var(--white)" />;
    case 'mania':
      return <ManiaIcon color="var(--white)" />;
    default:
      return <></>;
  }
};
