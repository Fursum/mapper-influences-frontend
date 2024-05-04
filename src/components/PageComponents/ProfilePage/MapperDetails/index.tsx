import MapCarousel from "@components/SharedComponents/MapCarousel/Slider";
import { editUser, useFullUser } from "@services/user";
import type { FC } from "react";

import EditableDescription from "../EditableDescription";
import MapStats from "./MapStats";
import ProfileInfo from "./ProfileInfo";
import styles from "./style.module.scss";

type Props = {
  userId?: number | string;
};

const MapperDetails: FC<Props> = ({ userId }) => {
  const { data: profileData, isLoading } = useFullUser(userId);
  const editable = !userId;

  return (
    <div className={styles.mapperDetails}>
      <div className={styles.info}>
        <ProfileInfo userId={userId} />
        <MapStats userId={userId} />
      </div>
      <div className={`${styles.bio} ${isLoading ? styles.loading : ""}`}>
        <div className={styles.desc}>
          <EditableDescription
            label={`Description textarea for ${profileData?.user_name}`}
            description={profileData?.bio || ""}
            placeholder={"Enter a description for your profile."}
            editable={editable}
            onChange={(e) => editUser({ bio: e.target.value })}
            statusText={{
              loading: "Submitting your bio.",
              error: "Could not submit your bio.",
              success: "Updated your bio.",
            }}
          />
        </div>
        {!!profileData?.featured_maps?.length && (
          <>
            <h4>Featured Maps</h4>
            <MapCarousel mapList={profileData?.featured_maps} />
          </>
        )}
      </div>
    </div>
  );
};

export default MapperDetails;
