import type { FC } from "react";

import styles from "./style.module.scss";

const CoolCards: FC = () => {
  const meta = [
    {
      // Culprate - Impulse
      url: "https://osu.ppy.sh/beatmapsets/705788#osu/1492654",
      video: "https://fur.s-ul.eu/xSsbXlcy",
    },
    {
      // sakuraburst - SELF DESTRUCT
      url: "https://osu.ppy.sh/beatmapsets/1411188#osu/3844605",
      video: "https://fur.s-ul.eu/Ewuqs5bu",
    },
    {
      // Chata - enn
      url: "https://osu.ppy.sh/beatmapsets/406217#osu/882812",
      video: "https://fur.s-ul.eu/zHBx0ywE",
    },
  ];

  return (
    <div className={styles.positioner}>
      <div className={styles.cardWrapper}>
        {meta.map((item) => (
          <a
            key={item.url}
            href={item.url}
            target={"_blank"}
            rel="noreferrer"
            className={styles.card}
          >
            <video autoPlay muted loop>
              <source src={item.video} type="video/webm" />
              {/* add mp4 fallback later */}
            </video>
            <div className={styles.overlay} />
            <div className={styles.shadow} />
          </a>
        ))}
      </div>
    </div>
  );
};
export default CoolCards;
