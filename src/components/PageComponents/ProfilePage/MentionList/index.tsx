import type { FC } from 'react';

import BaseProfileCard from '@components/SharedComponents/BaseProfileCard';
import type { UserExtended } from 'osu-web.js';

import styles from './style.module.scss';

type Props = { mentions: UserExtended[]; open?: boolean };
const MentionList: FC<Props> = ({ mentions, open }) => {
  return (
    <div
      className={styles.mentionList}
      style={!open ? { display: 'none' } : {}}
    >
      <div className={styles.mentionGrid}>
        {mentions.map((user) => (
          <BaseProfileCard key={user.id} userId={user.id} />
        ))}
      </div>
      <span>This feature is work in progress!</span>
      {/* mentions.length === 0 && <span>{'No mentions :('}</span> */}
    </div>
  );
};
export default MentionList;
