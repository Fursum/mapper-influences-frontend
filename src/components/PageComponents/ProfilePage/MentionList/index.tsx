import { type FC, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import BaseProfileCard from '@components/SharedComponents/BaseProfileCard';
import { type InfluenceResponse, useGetMentions } from '@services/influence';

import styles from './style.module.scss';

type Props = { open?: boolean; userId?: number | string };
const MentionList: FC<Props> = ({ open, userId }) => {
  const { data: mentions } = useGetMentions(userId);

  const [visibleMentions, setVisibleMentions] = useState<InfluenceResponse[]>(
    [],
  );

  useEffect(() => {
    setVisibleMentions(mentions?.slice(0, 10) || []);
  }, [mentions]);

  return (
    <div
      className={styles.mentionList}
      style={!open ? { display: 'none' } : {}}
    >
      {!mentions?.length && <span>{'No mentions :('}</span>}
      <InfiniteScroll
        initialLoad={true}
        className={styles.mentionGrid}
        loadMore={() =>
          mentions &&
          visibleMentions.length < mentions?.length &&
          setVisibleMentions(mentions?.slice(0, visibleMentions.length + 10))
        }
        hasMore={mentions && mentions.length > visibleMentions.length}
        useWindow={true}
      >
        {visibleMentions?.map((mention) => (
          <BaseProfileCard
            key={mention.influenced_by}
            userId={mention.influenced_by}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};
export default MentionList;
