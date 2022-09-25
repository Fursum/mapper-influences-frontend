import { FC } from "react";
import { UserBase } from "@libs/types/user";
import BaseProfileCard from "@components/SharedComponents/BaseProfileCard";

import styles from "./style.module.scss";

type Props = { mentions: UserBase[] };
const MentionList: FC<Props> = ({ mentions }) => {
  return (
    <div className={styles.mentionList}>
      <h2>Mentioned In</h2>
      {mentions.map((user) => (
        <BaseProfileCard key={user.id} userData={user} />
      ))}

      {mentions.length === 0 && <span>{"No mentions :("}</span>}
    </div>
  );
};
export default MentionList;
