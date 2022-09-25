import { FC } from "react";
import { MapInfo } from "@libs/types/user";

import styles from "./style.module.scss";

const MapCard: FC<MapInfo> = ({
  artist,
  backgroundUrl,
  diff,
  mapUrl,
  title,
}) => {
  return (
    <a
      href={mapUrl}
      target={"_blank"}
      rel="noreferrer"
      style={{ background: `url(${backgroundUrl})` }}
      className={styles.card}
    >
      <div>{artist}</div>
      <div>{title}</div>
      <div>{diff}</div>
    </a>
  );
};

export default MapCard;
