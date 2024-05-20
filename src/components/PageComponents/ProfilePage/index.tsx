import { type FC, useState } from 'react';

import { useGetInfluences, useGetMentions } from '@services/influence';
import { useGlobalTooltip } from '@states/globalTooltip';

import InfluenceList from './InfluenceList';
import MapperDetails from './MapperDetails';
import MentionList from './MentionList';

import styles from './style.module.scss';

type Props = { userId?: number | string };

const ProfilePage: FC<Props> = ({ userId }) => {
  return (
    <div className={styles.profilePage}>
      <MapperDetails userId={userId} />
      <TabContainer userId={userId} />
    </div>
  );
};

export default ProfilePage;

const TabContainer: FC<{ userId?: number | string }> = ({ userId }) => {
  const activateTooltip = useGlobalTooltip((state) => state.activateTooltip);
  const deactivateTooltip = useGlobalTooltip(
    (state) => state.deactivateTooltip,
  );
  const { data: influences } = useGetInfluences(userId);
  const { data: mentions } = useGetMentions(userId);

  const [selectedTab, setSelectedTab] = useState<'influences' | 'mentions'>(
    'influences',
  );

  return (
    <>
      <div className={styles.buttons}>
        <button
          className={selectedTab === 'influences' ? styles.selected : ''}
          onClick={() => setSelectedTab('influences')}
          onMouseEnter={() =>
            activateTooltip(
              `${influences?.length} influence${influences?.length === 1 ? '' : 's'}`,
            )
          }
          onMouseLeave={deactivateTooltip}
        >
          Influences
        </button>
        <button
          className={selectedTab === 'mentions' ? styles.selected : ''}
          onClick={() => setSelectedTab('mentions')}
          onMouseEnter={() =>
            activateTooltip(
              `${mentions?.length} mention${mentions?.length === 1 ? '' : 's'}`,
            )
          }
          onMouseLeave={deactivateTooltip}
        >
          Mentions
        </button>
      </div>
      <div className={styles.content}>
        <MentionList open={selectedTab === 'mentions'} userId={userId} />
        <InfluenceList userId={userId} open={selectedTab === 'influences'} />
      </div>
    </>
  );
};
