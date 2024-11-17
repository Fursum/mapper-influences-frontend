import type { FC } from 'react';

import type { UserSmall } from '@libs/types/rust';

import { useGlobalTooltip } from 'src/states/globalTooltip';

import styles from './style.module.scss';

type Props = { group: UserSmall['groups'][number] };
const Badge: FC<Props> = ({ group }) => {
  const activateTooltip = useGlobalTooltip((state) => state.activateTooltip);

  return (
    <span
      className={styles.badge}
      style={{
        color: group.colour || 'black',
        borderColor: group.colour || 'black',
      }}
      onMouseEnter={(e) => activateTooltip(group.name, e.currentTarget)}
    >
      {group.short_name}
    </span>
  );
};
export default Badge;
