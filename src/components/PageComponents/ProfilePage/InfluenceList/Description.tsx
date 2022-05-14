import React, { FC } from "react";
import styles from "./style.module.scss";

type Props = { descriptionData: string };

const Description: FC<Props> = ({ descriptionData }) => {
  return <div className={styles.influenceDescription}>{descriptionData}</div>;
};

export default Description;
