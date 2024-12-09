import type { FC } from 'react';

import BaseProfileCard from '@components/SharedComponents/BaseProfileCard';
import type { UserSmall } from '@libs/types/rust';

import styles from './style.module.scss';

const Results: FC<{ results: UserSmall[]; length?: number }> = ({
  results,
  length = 3,
}) => {
  return (
    <div className={styles.allResults}>
      {!!results.length && <h4>Matching users:</h4>}
      {!results.length && <h4>No users found.</h4>}
      {results.slice(0, length).map((user) => (
        <BaseProfileCard key={user.id} userData={user} />
      ))}
    </div>
  );
};
export default Results;
