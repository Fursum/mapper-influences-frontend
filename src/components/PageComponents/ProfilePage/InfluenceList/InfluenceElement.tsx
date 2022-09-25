import BaseProfileCard from "@components/SharedComponents/BaseProfileCard";
import React, { FC } from "react";
import { Influence } from "@libs/types/influence";
import EditableDescription from "../EditableDescription";
import InfluenceType from "./InfluenceType";
import MapCarousel from "@components/SharedComponents/MapCarousel";

import styles from "./style.module.scss";

const InfluenceElement: FC<{
  influenceData: Influence;
  editable?: boolean;
}> = ({ influenceData, editable }) => {
  return (
    <>
      <div className={styles.influenceRow}>
        <div className={styles.top}>
          <div className={styles.cardSide}>
            <BaseProfileCard userData={influenceData.profileData} />
            <InfluenceType editable influenceType={influenceData.type} />
          </div>
          <div className={styles.descriptionSide}>
            <div className={styles.desc}>
              <EditableDescription
                description={influenceData.description}
                editable={editable}
                placeholder={"Describe your influence here."}
              />
            </div>
          </div>
        </div>
        <div className={styles.maps}>
          <MapCarousel mapList={influenceData.maps || []} />
        </div>
      </div>
    </>
  );
};

export default InfluenceElement;
