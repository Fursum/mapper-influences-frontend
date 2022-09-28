import { FC } from "react";
import { MapInfo, UserBase, UserDetails } from "@libs/types/user";

import ProfileInfo from "./ProfileInfo";
import EditableDescription from "../EditableDescription";
import MapStats from "./MapStats";

import styles from "./style.module.scss";
import MapCarousel from "@components/SharedComponents/MapCarousel";

type Props = {
  profileData: UserBase;
  description: string;
  mapList: MapInfo[];
  details: UserDetails;
  editable: boolean;
};

const MapperDetails: FC<Props> = ({
  profileData,
  description,
  mapList,
  details,
  editable,
}) => {
  return (
    <div className={styles.mapperDetails}>
      <div className={styles.info}>
        <ProfileInfo profileData={profileData} />
        <MapStats details={details} />
      </div>
      <div className={styles.bio}>
        <div className={styles.desc}>
          <EditableDescription
            label={`Description textarea for ${profileData.username}`}
            description={description}
            placeholder={"Enter a description for your profile."}
            editable={editable}
          />
        </div>
        {mapList.length > 0 && (
          <>
            <h4>Featured Maps</h4>
            <MapCarousel mapList={mapList} />
          </>
        )}
      </div>
    </div>
  );
};

export default MapperDetails;
