import { type FC, useEffect, useState } from 'react';

import { useGetInfluences } from '@services/influence/getInfluences';
import { useGetMentions } from '@services/influence/mentions';
import { useGlobalTooltip } from '@states/globalTooltip';
import { useRouter } from 'next/router';

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
  const router = useRouter();

  const { data: influences } = useGetInfluences(userId);
  const { data: mentions } = useGetMentions(userId);
  const tooltipProps = useGlobalTooltip((state) => state.tooltipProps);

  const [selectedTab, setSelectedTab] = useState<'influences' | 'mentions'>(
    'influences',
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <reset only when user opens a new profile>
  useEffect(() => {
    if (selectedTab === 'mentions') setSelectedTab('influences');
  }, [router.asPath]);

  return (
    <>
      <div className={styles.buttons}>
        <button
          className={selectedTab === 'influences' ? styles.selected : ''}
          onClick={() => setSelectedTab('influences')}
          {...tooltipProps(
            `${influences?.length || 0} influence${influences?.length === 1 ? '' : 's'}`,
          )}
        >
          Influences
        </button>
        <button
          className={selectedTab === 'mentions' ? styles.selected : ''}
          onClick={() => setSelectedTab('mentions')}
          {...tooltipProps(
            `${mentions?.length || 0} mention${mentions?.length === 1 ? '' : 's'}`,
          )}
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
