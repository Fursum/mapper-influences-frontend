import { Group } from "@libs/types/IOsuApi";
import { FC } from "react";

import styles from "./style.module.scss";

type Props = { group: Group };
const Pill: FC<Props> = ({ group }) => {
  return (
    <span className={styles.pill} style={{ color: group.colour }}>
      {group.short_name}
      <span className={styles.tooltip}>{group.name}</span>
    </span>
  );
};
export default Pill;
