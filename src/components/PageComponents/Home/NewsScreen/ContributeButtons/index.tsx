import { FC } from "react";
import { Github, Discord } from "@components/SvgComponents";

import styles from "./style.module.scss";

export const ReportBug: FC = () => {
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

export const SendFeedback: FC = () => {
  return (
    <a
      className={styles.button}
      href={"https://discord.gg/SAwxBDe3Rf"}
      target="_blank"
      rel="noreferrer"
    >
      <h4>Make Suggestions</h4>
      <Discord className={styles.icon} />
    </a>
  );
};
