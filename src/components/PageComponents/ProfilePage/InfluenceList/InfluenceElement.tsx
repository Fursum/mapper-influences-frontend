import BaseProfileCard from "@components/SharedComponents/BaseProfileCard";
import React, { FC } from "react";
import { Influence } from "@libs/types/influence";
import EditableDescription from "../EditableDescription";

import styles from "./style.module.scss";
import InfluenceType from "./InfluenceType";

const InfluenceElement: FC<{
  influenceData: Influence;
  editable?: boolean;
}> = ({ influenceData, editable }) => {
  return (
    <div className={styles.influenceRow}>
      <div className={styles.cardSide}>
        <BaseProfileCard userData={influenceData.profileData} />
        <InfluenceType editable influenceType={influenceData.type} />
      </div>
      <div className={styles.descriptionSide}>
        <EditableDescription
          className={styles.influenceDescription}
          description={influenceData.description}
          editable={editable}
          placeholder={"Describe your influence here."}
        />
      </div>
    </div>
  );
};

export default InfluenceElement;
