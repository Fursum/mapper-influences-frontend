import { FeaturedMapsResponse } from "@services/user";
import { FC } from "react";

import styles from "./style.module.scss";

const MapCard: FC<{ map: FeaturedMapsResponse }> = ({ map }) => {
  const mapUrl = `https://osu.ppy.sh/beatmapsets/${map.beatmapset.id}${
    map.featured_map_id ? `#osu/${map.featured_map_id}` : ""
  }`;
  const { artist, title } = map.beatmapset.names;
  const diff = map.beatmapset.beatmaps.find(
    (b) => b.id === map.featured_map_id
  );

  return (
    <a
      href={mapUrl}
      target={"_blank"}
      rel="noreferrer"
      style={{ background: `url(${map.beatmapset.covers.cover})` }}
      className={styles.card}
    >
      <div>{artist}</div>
      <div>{title}</div>
      {diff && <div>{diff.name}</div>}
    </a>
  );
};

export default MapCard;
