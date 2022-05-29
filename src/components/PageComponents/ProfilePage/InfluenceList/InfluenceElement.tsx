import BaseProfileCard from "@components/SharedComponents/BaseProfileCard";
import React, { FC } from "react";
import { Influence } from "@libs/types/influence";

import styles from "./style.module.scss";
import EditableDescription from "../EditableDescription";

type Props = {
  influenceData: Influence;
};

const InfluenceElement: FC<Props> = ({ influenceData }) => {
  return (
    <div className={styles.influenceRow}>
      <BaseProfileCard userData={influenceData.profileData} />
      <EditableDescription className={styles.influenceDescription} description={influenceData.description} />
    </div>
  );
};

export default InfluenceElement;
