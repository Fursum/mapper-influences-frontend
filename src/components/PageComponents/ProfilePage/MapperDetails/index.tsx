import { FC } from "react";
import { UserBase, UserDetails } from "@libs/types/user";
import Stats from "./Stats";

import styles from "../profilePage.module.scss";
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
      <ProfileInfo profileData={profileData} />
      <EditableDescription description={description} editable/>
      <Stats details={details} />
    </div>
  );
};

export default MapperDetails;
