import React, { FC } from "react";
import { User } from "src/libs/types/user";
import InfluenceList from "./InfluenceList";
import MapperDetails from "./MapperDetails";

import styles from "./profilePage.module.scss";

type Props = { userData: User; editable?: boolean };

const ProfilePage: FC<Props> = ({ userData, editable = false }) => {
  return (
    <div className={styles.profilePage}>
      <MapperDetails
        description={userData.description}
        details={userData.details}
        profileData={{
          username: userData.username,
          avatarUrl: userData.avatarUrl,
          id: userData.id,
        }}
      />
      <InfluenceList influences={userData.influences} />
    </div>
  );
};

export default ProfilePage;
