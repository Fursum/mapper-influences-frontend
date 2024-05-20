import type { DetailedHTMLProps, FC, HTMLAttributes } from 'react';

import { DEFAULT_AVATAR } from '@libs/consts';

import styles from './style.module.scss';

type Props = {
  photoUrl?: string;
  size: 'md' | 'lg' | 'xl';
  className?: string;
  circle?: boolean;
  loading?: boolean;
  parentProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
};

const ProfilePhoto: FC<Props> = ({
  photoUrl,
  size,
  className,
  circle,
  loading,
  parentProps,
}) => {
  return (
    <div
      {...parentProps}
      className={`${styles.wrapper} ${styles[size]} ${className} ${
        circle ? styles.circle : ''
      } ${loading ? styles.loading : ''}`}
    >
      {!loading && (
        <img src={photoUrl || DEFAULT_AVATAR} alt="avatar" loading="lazy" />
      )}
    </div>
  );
};

export default ProfilePhoto;
