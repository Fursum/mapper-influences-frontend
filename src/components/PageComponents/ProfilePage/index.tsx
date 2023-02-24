import React, { FC } from "react";
import { User, UserBase } from "@libs/types/user";
import InfluenceList from "./InfluenceList";
import MapperDetails from "./MapperDetails";
import MentionList from "./MentionList";

import styles from "./style.module.scss";
import { useSessionStore } from "src/states/user";
import { useRouter } from "next/router";

type Props = { userData: User; editable?: boolean };

const ProfilePage: FC<Props> = ({ userData, editable = false }) => {
  const { logout } = useSessionStore();
  const router = useRouter();

  function onSignOut() {
    logout();
    router.push("/");
  }

  return (
    <div className={styles.profilePage}>
      <MapperDetails
        description={userData.description}
        mapList={userData.maps}
        details={userData.details}
        profileData={userData as UserBase}
        editable={editable}
      />
      <div className={styles.doubleCol}>
        <InfluenceList influences={userData.influences} editable={editable} />
        <MentionList mentions={userData.mentions} />
      </div>
      <button onClick={onSignOut}>Sign out</button>
    </div>
  );
};

export default ProfilePage;
