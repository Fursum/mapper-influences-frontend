import { FC } from "react";

import styles from "./style.module.scss";

const CoolCards: FC = () => {
  const meta = [
    {
      url: "https://osu.ppy.sh/beatmapsets/705788#osu/1492654",
      video: "lH5Hyy-4s7U",
    },
    {
      url: "https://osu.ppy.sh/beatmapsets/1411188#osu/3844605",
      video: "qbfpUjC6sZ0",
    },
    {
      url: "https://osu.ppy.sh/beatmapsets/406217#osu/882812",
      video: "eYDS1vdnGD4",
    },
  ];

  return (
    <div className={styles.positioner}>
      <div className={styles.cardWrapper}>
        {meta.map((item, i) => (
          <a
            key={item.url + i}
            href={item.url}
            target={"_blank"}
            rel="noreferrer"
            className={styles.card}
          >
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${item.video}?autoplay=1&controls=0&mute=1&loop=1&showinfo=0&rel=0&playlist=${item.video}`}
              frameBorder="0"
              allow="autoplay"
            />
            <div className={styles.overlay} />
            <div className={styles.shadow} />
          </a>
        ))}
      </div>
    </div>
  );
};
export default CoolCards;
