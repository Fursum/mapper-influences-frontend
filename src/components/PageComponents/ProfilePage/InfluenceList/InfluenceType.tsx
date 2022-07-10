import { InfluenceOrder, InfluenceTypeEnum } from "@libs/types/influence";
import { FC, useState } from "react";

import styles from "./style.module.scss";

type Props = {
  editable?: boolean;
  influenceType?: InfluenceTypeEnum;
};
const InfluenceType: FC<Props> = ({
  editable,
  influenceType = InfluenceTypeEnum.Fascination,
}) => {
  const [influenceState, setInfluenceState] = useState(influenceType);

  const reduceInfluence = () => {
    setInfluenceState((oldType) => {
      let index = InfluenceOrder.indexOf(oldType);
      index = Math.max(index - 1, 0);

      //TODO: Send update to api here
      return InfluenceOrder[index];
    });
  };

  const increaseInfluence = () => {
    setInfluenceState((oldType) => {
      let index = InfluenceOrder.indexOf(oldType);
      index = Math.min(index + 1, InfluenceOrder.length - 1);

      //TODO: Send update to api here
      return InfluenceOrder[index];
    });
  };

  const showMinusButton =
    editable && influenceState !== InfluenceTypeEnum.Respect;
  const MinusButton = (
    <button
      aria-label="Decrease Influence"
      className={styles.minus}
      onClick={reduceInfluence}
    >
      {"<"}
    </button>
  );

  const showPlusButton =
    editable && influenceState !== InfluenceTypeEnum.Implementation;
  const PlusButton = (
    <button
      aria-label="Increase Influence"
      className={styles.plus}
      onClick={increaseInfluence}
    >
      {">"}
    </button>
  );

  return (
    <div className={styles.influenceType}>
      {showMinusButton && MinusButton}
      {influenceState}
      {showPlusButton && PlusButton}
    </div>
  );
};
export default InfluenceType;
