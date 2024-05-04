import BaseProfileCard from "@components/SharedComponents/BaseProfileCard";
import { UserBaseResponse } from "@services/user";
import { FC } from "react";

import styles from "./style.module.scss";

const Results: FC<{ results: UserBaseResponse[]; length?: number }> = ({
  results,
  length = 3,
}) => {
  return (
    <div className={styles.allResults}>
      {!!results.length && <h4>Matching users:</h4>}
      {!results.length && <h4>No users found.</h4>}
      {results.slice(0, length).map((user) => (
        <BaseProfileCard userId={user.id} key={user.id} />
      ))}
    </div>
  );
};
export default Results;
