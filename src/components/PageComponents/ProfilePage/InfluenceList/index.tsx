import React, { FC } from "react";
import { Influence } from "@libs/types/influence";

import styles from "./style.module.scss";
import InfluenceElement from "./InfluenceElement";

const InfluenceList: FC<{ influences: Influence[]; editable?: boolean }> = ({
  influences,
  editable,
}) => {
  const InfluenceCards = influences.map((influence) => (
    <InfluenceElement
      key={influence.profileData.id}
      influenceData={influence}
      editable={editable}
    />
  ));

  return (
    <div className={styles.mapperInfluences}>
      <h2>Influenced By</h2>
      {InfluenceCards}
      {influences.length === 0 && (
        <span>
          {`This person is unique!`}
          <br />
          {`...Or they haven't added anyone yet.`}
        </span>
      )}
    </div>
  );
};

export default InfluenceList;
