import { FC } from "react";

import styles from "./style.module.scss";

const CoolCards: FC = () => {
  return (
    <div className={styles.positioner}>
      <div className={styles.cardWrapper}>
        <div>card1</div>
        <div>card2</div>
        <div>card3</div>
      </div>
    </div>
  );
};
export default CoolCards;
