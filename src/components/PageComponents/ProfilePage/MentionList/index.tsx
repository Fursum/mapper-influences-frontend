import type { FC } from 'react';

import BaseProfileCard from '@components/SharedComponents/BaseProfileCard';
import { useGetMentions } from '@services/influence';

import styles from './style.module.scss';

type Props = { open?: boolean; userId?: number | string };
const MentionList: FC<Props> = ({ open, userId }) => {
  const { data: mentions } = useGetMentions(userId);

  return (
    <div
      className={styles.mentionList}
      style={!open ? { display: 'none' } : {}}
    >
      <div className={styles.mentionGrid}>
        {mentions?.map((mention) => (
          <BaseProfileCard
            key={mention.influenced_by}
            userId={mention.influenced_by}
          />
        ))}
      </div>

      {!mentions?.length && <span>{'No mentions :('}</span>}
    </div>
  );
};
export default MentionList;
