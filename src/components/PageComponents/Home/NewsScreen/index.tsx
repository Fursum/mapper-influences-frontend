import type { FC } from 'react';

import ActivityList from '@components/SharedComponents/Activity';
import { Graph } from '@components/SvgComponents';
import Arrow from '@components/SvgComponents/Arrow';
import Link from 'next/link';

import ContributeButtons from '../../../SharedComponents/ContributeButtons';
import Leaderboard from '../../../SharedComponents/Leaderboard';

import styles from './style.module.scss';

const NewsScreen: FC = () => {
  return (
    <div className={styles.newsScreen}>
      <Link href="/graph" className={styles.graphCard}>
        <Graph className={styles.graphIcon} />
        <div className={styles.graphText}>
          <span className={styles.graphTitle}>
            Explore the influence graph
          </span>
          <span className={styles.graphSubtitle}>
            See how the whole mapping community connects
          </span>
        </div>
        <Arrow className={styles.graphArrow} />
      </Link>
      <div className={styles.double}>
        <Leaderboard className={styles.topInfluencers} type="user" />
        <Leaderboard className={styles.topInfluencers} type="beatmap" />
        <ActivityList />
      </div>
      <ContributeButtons className={styles.contribute} />
    </div>
  );
};
export default NewsScreen;
