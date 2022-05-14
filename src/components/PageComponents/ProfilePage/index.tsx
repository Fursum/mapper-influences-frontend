import React, { FC } from "react";
import { User } from "src/types/user";
import InfluenceList from "./InfluenceList";
import MapperDetails from "./MapperDetails";

import styles from "./profilePage.module.scss";

type Props = { userData: User };

const ProfilePage: FC<Props> = ({ userData }) => {
  return (
    <div className={styles.profilePage}>
      <MapperDetails
        description={userData.description}
        details={userData.details}
        name={userData.username}
      />
      <InfluenceList influences={userData.influences} />
    </div>
  );
};

export default ProfilePage;
