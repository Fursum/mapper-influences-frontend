import { FC } from "react";

import styles from "./style.module.scss";

const CoolCards: FC = () => {
  const meta = [
    {
      url: "https://osu.ppy.sh/beatmapsets/1536948",
      video:
        "https://cdn.discordapp.com/attachments/645591556585291776/1038477819912650792/example1.webm",
    },
    {
      url: "https://osu.ppy.sh/beatmapsets/1846040",
      video:
        "https://cdn.discordapp.com/attachments/645591556585291776/1038477820751515789/example2.webm",
    },
    {
      url: "https://osu.ppy.sh/beatmapsets/855677",
      video: "Bzj7u4Q5GG0",
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
            className={styles.card}>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${item.video}?autoplay=1&controls=0&mute=1&loop=1`}
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
