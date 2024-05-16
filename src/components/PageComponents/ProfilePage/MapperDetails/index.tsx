import MapCarousel from "@components/SharedComponents/MapCarousel/Slider";
import type { FC } from "react";

import EditableDescription from "../EditableDescription";
import MapStats from "./MapStats";
import ProfileInfo from "./ProfileInfo";
import styles from "./style.module.scss";
import { useFullUser } from "@hooks/useUser";

type Props = {
  userId?: number | string;
};

const MapperDetails: FC<Props> = ({ userId }) => {
  const { data: osuData, isLoading } = useFullUser(userId?.toString());
  const editable = !userId;

  const profileData = {} as any;

  return (
    <div className={styles.mapperDetails}>
      <div className={styles.info}>
        <ProfileInfo userId={userId} />
        <MapStats userId={userId} />
      </div>
      <div className={`${styles.bio} ${isLoading ? styles.loading : ""}`}>
        <div className={styles.desc}>
          <EditableDescription
            label={`Description textarea for ${osuData?.username}`}
            description={profileData?.bio || ""}
            placeholder={"Enter a description for your profile."}
            editable={editable}
            onChange={(e) => {}}
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
