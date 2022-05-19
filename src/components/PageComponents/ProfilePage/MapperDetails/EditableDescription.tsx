import { FC } from "react";

import styles from "../profilePage.module.scss";

type Props = { description: string };
const EditableDescription: FC<Props> = ({ description }) => {
  return <div className={styles.description}>{description}</div>;
};
export default EditableDescription;
