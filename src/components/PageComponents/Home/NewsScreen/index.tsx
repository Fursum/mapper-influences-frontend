import type { FC } from 'react';

import News from '@components/SharedComponents/News';
import type { NewsType } from '@libs/types/influence';

import ContributeButtons from '../../../SharedComponents/ContributeButtons';
import Leaderboard from '../../../SharedComponents/Leaderboard';

import styles from './style.module.scss';

type Props = {
  newsList: NewsType[];
};
const NewsScreen: FC<Props> = ({ newsList }) => {
  return (
    <div className={styles.newsScreen}>
      <div className={styles.double}>
        <Leaderboard className={styles.topInfluencers} />
        <News newsList={newsList} className={styles.newsContainer} />
      </div>
      <ContributeButtons className={styles.contribute} />
    </div>
  );
};
export default NewsScreen;
