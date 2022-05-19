import ProfileCard from "@components/SharedComponents/ProfileCard";
import React, { FC } from "react";
import { Influence } from "src/types/influence";
import Description from "./Description";

import styles from "./style.module.scss";

type Props = {
  influenceData: Influence;
};

const InfluenceElement: FC<Props> = ({ influenceData }) => {
  return (
    <div className={styles.influenceRow}>
      <ProfileCard userData={influenceData.profileData} />
      <Description descriptionData={influenceData.description} />
    </div>
  );
};

export default InfluenceElement;
