import ProfileCard from "@components/SharedComponents/ProfileCard";
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
      <ProfileCard userData={influenceData.profileData} />
      <EditableDescription description={influenceData.description} />
    </div>
  );
};

export default InfluenceElement;
