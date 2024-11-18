import { type FC, useEffect, useMemo, useRef } from 'react';

import ProfilePhoto from '@components/SharedComponents/ProfilePhoto';
import useAuth from '@hooks/useAuth';
import { OSU_BASE_URL } from '@libs/consts/urls';
import { useGetInfluences } from '@services/influence/getInfluences';
import { useUserBio } from '@services/user';
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

  const { data: userBio, isLoading: bioLoading } = useUserBio(
    userId?.toString(),
  );
  const { data: currentUserInfluences } = useGetInfluences();

  const mapperName = userBio?.username ?? '';

  const isAlreadyAdded = useMemo(() => {
    if (!currentUserInfluences) return false;
    return currentUserInfluences.some(
      (influence) => influence.user.id.toString() === userId?.toString(),
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
  }, [mapperName]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <Name change effects the element>
  useEffect(() => {
    // Run fit text on name and loading change
    if (!nameRef.current) return;
    textFit(nameRef.current);
  }, [mapperName, bioLoading]);

  const UserGroup = () => {
    if (!userBio?.groups?.length) return <></>;

    // If the name ends with an 's', cut it off
    let name = userBio.groups[0].name;
    if (name.endsWith('s')) name = name.slice(0, -1);

    return (
      <div
        className={styles.title}
        style={{ color: userBio.groups[0].colour || 'inherit' }}
      >
        {name}
      </div>
    );
  };

  if (bioLoading)
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
        href={`${OSU_BASE_URL}users/${userBio?.id}`}
        target="_blank"
        rel="noreferrer"
      >
        <ProfilePhoto
          photoUrl={userBio?.avatar_url}
          loading={bioLoading}
          size="xl"
          circle
          className={styles.avatar}
        />
      </a>
      <div className={styles.rightSide}>
        <a
          href={`${OSU_BASE_URL}users/${userBio?.id}`}
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.mapperName} ref={nameRef}>
            {userBio?.username ?? userBio?.username ?? ''}
          </div>
        </a>
        {userBio?.country_code && (
          <div className={styles.flag}>
            <img
              alt="Flag"
              src={`https://flagcdn.com/${userBio.country_code.toLowerCase()}.svg`}
            />
            <span>{userBio.country_name}</span>
          </div>
        )}
        <UserGroup />
        {!ownProfile && userBio && (
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
