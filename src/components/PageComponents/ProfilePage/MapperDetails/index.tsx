import { FC } from "react";
import { UserBase, UserDetails } from "@libs/types/user";
import Stats from "./Stats";

import styles from "./style.module.scss";
import ProfileInfo from "./ProfileInfo";
import EditableDescription from "../EditableDescription";

type Props = {
  profileData: UserBase;
  description: string;
  details: UserDetails;
};

const MapperDetails: FC<Props> = ({ profileData, description, details }) => {
  return (
    <div className={styles.mapperDetails}>
      <div className={styles.stickyWrapper}>
        <ProfileInfo profileData={profileData} />
        <EditableDescription description={description} editable />
        <Stats details={details} />
      </div>
    </div>
  );
};

export default MapperDetails;
