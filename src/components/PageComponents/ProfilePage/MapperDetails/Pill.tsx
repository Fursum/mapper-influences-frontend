import Image from "next/image";
import { FC } from "react";

import styles from "../profilePage.module.scss"

type Props = {
  type: "Followers" | "Subscribers" | "Ranked" | "Loved" | "Pending" | "Graved";
  count: number;
};
const Pill: FC<Props> = ({ type, count }) => {
  const iconPath = `/svg/${type}.svg`;

  return (
    <div className={styles.pill}>
      <div className={styles.icon}><Image src={iconPath} alt={`${type} icon`} layout="fill" /></div>
      <span className={styles.countText}>{count}</span>
    </div>
  );
};
export default Pill;
