import { ProfileInfoIcons } from "@libs/types/influence";
import Image from "next/image";
import { FC } from "react";
import PillIcon from "./PillIcon";

import styles from "./style.module.scss"

type Props = {
  type: ProfileInfoIcons;
  count: number;
};
const Pill: FC<Props> = ({ type, count }) => {
  const iconPath = `/svg/${type}.svg`;

  return (
    <div className={styles.pill}>
      <span className={styles.tooltip}>{type}</span>
      <PillIcon iconName={type} className={styles.icon}/>
      <span className={styles.countText}>{count}</span>
    </div>
  );
};
export default Pill;
