import { FC } from "react";
import { UserBase, UserDetails } from "@libs/types/user";
import Stats from "./Stats";

import styles from "./style.module.scss";
import ProfileInfo from "./ProfileInfo";
import EditableDescription from "../EditableDescription";
import AddUserButton from "./AddUserButton";

type Props = {
  profileData: UserBase;
  description: string;
  details: UserDetails;
  editable: boolean;
};

const MapperDetails: FC<Props> = ({
  profileData,
  description,
  details,
  editable,
}) => {
  const addUserHandler = () => {
    // TODO: Add user service
  };

  return (
    <div className={styles.mapperDetails}>
      <div className={styles.stickyWrapper}>
        <ProfileInfo profileData={profileData} />
        <AddUserButton onClick={addUserHandler} />
        <EditableDescription
          description={description}
          placeholder={"Enter a description for your profile."}
          editable={editable}
        />
        <Stats details={details} />
      </div>
    </div>
  );
};

export default MapperDetails;
