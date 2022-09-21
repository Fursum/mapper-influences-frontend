import { FC } from "react";

import styles from "./style.module.scss";

const CoolCards: FC = () => {
  return (
    <div className={styles.positioner}>
      <div className={styles.cardWrapper}>
        <a
          href="https://osu.ppy.sh/beatmapsets/1536948"
          target={"_blank"}
          rel="noreferrer"
        >
          <video autoPlay muted loop playsInline>
            <source src="/example1.webm" type="video/webm" />
          </video>
          <div className={styles.shadow}/>
        </a>
        <div>card2</div>
        <div>card3</div>
      </div>
    </div>
  );
};
export default CoolCards;
