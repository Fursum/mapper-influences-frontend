import type { FC } from 'react';

import styles from './style.module.scss';

type Props = {
  photoUrl?: string;
  size: 'md' | 'lg' | 'xl';
  className?: string;
  circle?: boolean;
  loading?: boolean;
};

const ProfilePhoto: FC<Props> = ({
  photoUrl,
  size,
  className,
  circle,
  loading,
}) => {
  return (
    <div
      className={`${styles.wrapper} ${styles[size]} ${className} ${
        circle ? styles.circle : ''
      } ${loading ? styles.loading : ''}`}
    >
      {!loading && <img src={photoUrl || '/defaultAvatar.png'} alt="avatar" />}
    </div>
  );
};

export default ProfilePhoto;
