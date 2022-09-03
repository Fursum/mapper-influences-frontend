import { FC } from "react";
import Github from "@components/SvgComponents/Github";

import styles from "./style.module.scss";
import Discord from "@components/SvgComponents/Discord";

type Props = {};
export const ReportBug: FC<Props> = ({}) => {
  return (
    <a
      className={styles.button}
      href={"https://github.com/Fursum/Mapper-Influences-Frontend/issues"}
      target="_blank"
      rel="noreferrer"
    >
      <h4>Report Bugs</h4>
      <Github className={styles.icon} />
    </a>
  );
};

//TODO: Create discord server
export const SendFeedback: FC<Props> = ({}) => {
  return (
    <a
      className={styles.button}
      href={"discord server link"}
      target="_blank"
      rel="noreferrer"
    >
      <h4>Make Suggestions</h4>
      <Discord className={styles.icon} />
    </a>
  );
};
