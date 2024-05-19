import { type FC, useEffect, useMemo, useRef } from 'react';

import ProfilePhoto from '@components/SharedComponents/ProfilePhoto';
import useAuth from '@hooks/useAuth';
import { OSU_BASE_URL } from '@libs/consts/urls';
import { useGetInfluences } from '@services/influence';
import { useFullUser } from '@services/user';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

import AddUserButton from '../AddUserButton';

import styles from './style.module.scss';

const textFit = require('textfit');

type Props = {
  userId?: string | number;
};

const ProfileInfo: FC<Props> = ({ userId }) => {
  const { logout } = useAuth();
  const ownProfile = !userId;

  const { data: osuData, isLoading } = useFullUser(userId?.toString());
  const { data: currentUserInfluences } = useGetInfluences();

  const isAlreadyAdded = useMemo(() => {
    if (!currentUserInfluences) return false;
    return currentUserInfluences.some(
      (influence) => influence.influenced_to.toString() === userId?.toString(),
    );
  }, [currentUserInfluences, userId]);

  const nameRef = useRef(null);

  // Fit text to card on resize and on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: <ref changes on data>
  useEffect(() => {
    if (!nameRef.current) return;
    const runFitText = () => textFit(nameRef.current);
    const debounceFitText = AwesomeDebouncePromise(runFitText, 50);

    document.fonts.ready.then(() => runFitText());
    window.addEventListener('resize', debounceFitText);
    return () => {
      window.removeEventListener('resize', debounceFitText);
    };
  }, [osuData]);

  const UserGroup = () => {
    if (!osuData?.groups?.length) return <></>;

    // If the name ends with an 's', cut it off
    let name = osuData.groups[0].name;
    if (name.endsWith('s')) name = name.slice(0, -1);

    return (
      <div
        className={styles.title}
        style={{ color: osuData.groups[0].colour || 'inherit' }}
      >
        {name}
      </div>
    );
  };

  if (isLoading)
    return (
      <div className={`${styles.skeleton} ${styles.profileInfo}`}>
        <ProfilePhoto
          loading={true}
          size="xl"
          circle
          className={styles.avatar}
        />
        <div className={styles.rightSide}>
          <div className={styles.mapperName} ref={nameRef} />
          <div className={styles.title} />
          {!ownProfile && <div className={styles.addUser} />}
        </div>
      </div>
    );

  return (
    <div className={styles.profileInfo}>
      <a
        href={`${OSU_BASE_URL}users/${osuData?.id}`}
        target="_blank"
        rel="noreferrer"
      >
        <ProfilePhoto
          photoUrl={osuData?.avatar_url}
          loading={isLoading}
          size="xl"
          circle
          className={styles.avatar}
        />
      </a>
      <div className={styles.rightSide}>
        <a
          href={`${OSU_BASE_URL}users/${osuData?.id}`}
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.mapperName} ref={nameRef}>
            {osuData?.username}
          </div>
        </a>
        <UserGroup />
        {!ownProfile && (
          <AddUserButton
            userId={userId}
            action={isAlreadyAdded ? 'remove' : 'add'}
          />
        )}
        {ownProfile && <button onClick={logout}>Sign Out</button>}
      </div>
    </div>
  );
};

export default ProfileInfo;
