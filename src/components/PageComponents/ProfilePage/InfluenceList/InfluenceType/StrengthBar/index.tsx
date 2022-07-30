import { FC } from "react";

import styles from "./style.module.scss";

type Props = { strength: number };
const StrengthBar: FC<Props> = ({ strength }) => {
  return (
    <div className={styles.strengthWrapper}>
      {Array.from(Array(strength).keys()).map((v, i) => (
        <div key={`bar-${i}`} className={styles.strengthBar} />
      ))}
    </div>
  );
};
export default StrengthBar;
