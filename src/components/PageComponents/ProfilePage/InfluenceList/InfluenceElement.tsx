import BaseProfileCard from "@components/SharedComponents/BaseProfileCard";
import MapCarousel from "@components/SharedComponents/MapCarousel/SingleItem";
import { convertFromInfluence } from "@libs/enums";
import {
  editInfluenceInfo,
  editInfluenceLevel,
  type InfluenceResponse,
} from "@services/influence";
import { forwardRef } from "react";

import EditableDescription from "../EditableDescription";
import InfluenceType from "./InfluenceType";
import styles from "./style.module.scss";

type Props = {
  influenceData: InfluenceResponse;
  editable?: boolean;
};

const InfluenceElement = forwardRef<HTMLDivElement, Props>(
  ({ influenceData, editable }, ref) => (
    <>
      <div className={styles.influenceRow} ref={ref}>
        <div className={styles.cardWrapper}>
          <InfluenceType
            editable={editable}
            influenceData={influenceData}
            onChange={(type) =>
              editInfluenceLevel({
                from_id: influenceData.from_id,
                level: convertFromInfluence(type),
              })
            }
          />
          <BaseProfileCard
            userId={influenceData.from_id}
            className={`${editable ? styles.editable : ""}`}
          />
        </div>
        <EditableDescription
          className={styles.description}
          label={`Description textarea`}
          description={influenceData.info || ""}
          editable={editable}
          placeholder={"Describe your influence here."}
          onChange={(e) =>
            editInfluenceInfo({
              from_id: influenceData.from_id,
              info: e.target.value,
            })
          }
          statusText={{
            loading: "Submitting influence description.",
            error: "Could not update influence description.",
            success: "Updated influence description.",
          }}
        />
        {false && (
          <div className={styles.maps}>
            <h4>Featured Maps</h4>
            <MapCarousel mapList={[]} />
          </div>
        )}
      </div>
    </>
  )
);

InfluenceElement.displayName = "InfluenceElement";

export default InfluenceElement;
