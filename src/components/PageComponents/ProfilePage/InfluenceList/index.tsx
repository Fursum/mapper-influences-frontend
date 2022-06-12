import React, { FC } from "react";
import { Influence } from "@libs/types/influence";

import styles from "./style.module.scss";
import InfluenceElement from "./InfluenceElement";

type Props = { influences: Influence[] };

const InfluenceList: FC<Props> = ({ influences }) => {
  const InfluenceCards = influences.map((influence) => (
    <InfluenceElement
      key={influence.profileData.username}
      influenceData={influence}
    />
  ));

  return (
    <div className={styles.mapperInfluences}>
      <h2>Influences</h2>
      {InfluenceCards}
    </div>
  );
};

export default InfluenceList;
