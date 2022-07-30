import { FC } from "react";
import PillIcon from "../PillIcon";

import styles from "./style.module.scss";

type Props = {
  onClick: () => void;
};

const AddUserButton: FC<Props> = ({ onClick }) => {
  return (
    <button className={styles.addUser} onClick={onClick}>
      <PillIcon iconName="Influences" className={styles.icon} /> Add Influence
    </button>
  );
};
export default AddUserButton;
