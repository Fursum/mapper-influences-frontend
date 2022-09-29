import Arrow from "@components/SvgComponents/Arrow";
import { InfluenceOrder, InfluenceTypeEnum } from "@libs/types/influence";
import { FC, useState } from "react";
import StrengthBar from "./StrengthBar";

import styles from "./style.module.scss";

type Props = {
  editable?: boolean;
  influenceType?: InfluenceTypeEnum;
  influenceStrength?: 1 | 2 | 3;
};
const InfluenceType: FC<Props> = ({
  editable,
  influenceType = InfluenceTypeEnum.Fascination,
  influenceStrength = 1,
}) => {
  const [typeState, setTypeState] = useState(influenceType);
  const [strengthState, setStrengthState] = useState<number>(influenceStrength);

  const reduceInfluence = () => {
    if (strengthState === 1) {
      setTypeState((oldType) => {
        let index = InfluenceOrder.indexOf(oldType);
        index = Math.max(index - 1, 0);

        return InfluenceOrder[index];
      });
      setStrengthState(3);
    } else
      setStrengthState((oldStrength) =>
        oldStrength > 1 ? oldStrength - 1 : 1
      );

    //TODO: Send update to api here
  };

  const increaseInfluence = () => {
    if (strengthState === 3) {
      setTypeState((oldType) => {
        let index = InfluenceOrder.indexOf(oldType);
        index = Math.min(index + 1, InfluenceOrder.length - 1);

        return InfluenceOrder[index];
      });
      setStrengthState(1);
    } else
      setStrengthState((oldStrength) =>
        oldStrength < 3 ? oldStrength + 1 : 3
      );

    //TODO: Send update to api here
  };

  const hideMinusButton =
    !editable ||
    (typeState === InfluenceTypeEnum.Respect && strengthState === 1);
  const MinusButton = (
    <button
      aria-label="Decrease Influence"
      className={`${styles.minus} ${strengthState === 1 ? styles.notch : ""}`}
      onClick={reduceInfluence}
    >
      <Arrow color={"var(--buttonOutline)"} />
    </button>
  );

  const hidePlusButton =
    !editable ||
    (typeState === InfluenceTypeEnum.Implementation && strengthState === 3);
  const PlusButton = (
    <button
      aria-label="Increase Influence"
      className={`${styles.plus} ${strengthState === 3 ? styles.notch : ""}`}
      onClick={increaseInfluence}
    >
      <Arrow color={"var(--buttonOutline)"} />
    </button>
  );

  return (
    <>
      <StrengthBar strength={strengthState} />
      <div className={styles.influenceType}>
        {!hideMinusButton && MinusButton}
        {typeState}
        {!hidePlusButton && PlusButton}
      </div>
    </>
  );
};
export default InfluenceType;
