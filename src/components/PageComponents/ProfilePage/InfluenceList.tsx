import React, { FC } from "react";
import { Influence } from "src/types/influence";

import styles from "./profilePage.module.scss";

type Props = { influences: Influence[] };

const InfluenceList: FC<Props> = ({}) => {
  return <div className={styles.mapperInfluences}>InfluenceList</div>;
};

export default InfluenceList;
