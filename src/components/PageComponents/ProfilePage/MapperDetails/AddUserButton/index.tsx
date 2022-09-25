import { FC } from "react";

import styles from "./style.module.scss";

type Props = {
  onClick: () => void;
};

const AddUserButton: FC<Props> = ({ onClick }) => {
  return (
    <button className={styles.addUser} onClick={onClick}>
      Add Influence
    </button>
  );
};
export default AddUserButton;
