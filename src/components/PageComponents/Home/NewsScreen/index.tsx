import type { FC } from 'react';

import ActivityList from '@components/SharedComponents/Activity';
import News from '@components/SharedComponents/News';

import ContributeButtons from '../../../SharedComponents/ContributeButtons';
import Leaderboard from '../../../SharedComponents/Leaderboard';

import styles from './style.module.scss';

const NewsScreen: FC = () => {
  return (
    <div className={styles.newsScreen}>
      <div className={styles.double}>
        <Leaderboard className={styles.topInfluencers} />
        <News className={styles.newsContainer} />
        <ActivityList />
      </div>
      <ContributeButtons className={styles.contribute} />
    </div>
  );
};
export default NewsScreen;
