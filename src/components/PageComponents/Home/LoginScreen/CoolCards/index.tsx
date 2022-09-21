import { FC } from "react";

import styles from "./style.module.scss";

const CoolCards: FC = () => {
  const meta = [
    {
      url: "https://osu.ppy.sh/beatmapsets/1536948",
      filePath: "/example1.webm",
    },
    {
      url: "https://osu.ppy.sh/beatmapsets/1846040",
      filePath: "/example2.webm",
    },
    {
      url: "https://osu.ppy.sh/beatmapsets/855677",
      filePath: "/example3.webm",
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
          >
            <video autoPlay muted loop playsInline>
              <source src={item.filePath} type="video/webm" />
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
