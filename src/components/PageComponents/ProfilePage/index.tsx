import React, { FC } from "react";
import { User } from "@libs/types/user";
import InfluenceList from "./InfluenceList";
import MapperDetails from "./MapperDetails";
import MentionList from "./MentionList";

import styles from "./style.module.scss";

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
        editable={editable}
      />
      <InfluenceList influences={userData.influences} editable={editable} />
      <MentionList mentions={[]} />
    </div>
  );
};

export default ProfilePage;
