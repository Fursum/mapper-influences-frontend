import { type FC, useEffect, useState } from 'react';

import DarkModeToggle from '@components/Layout/Header/DarkModeToggle';
import ProfilePhoto from '@components/SharedComponents/ProfilePhoto';
import { Graph, Influences } from '@components/SvgComponents';
import { getOsuAuthUrl } from '@libs/consts/urls';
import type { UserSmall } from '@libs/types/rust';
import { useCurrentUser } from '@services/user';
import { useGlobalTooltip } from '@states/globalTooltip';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';

import SearchBar from './SearchBar';

import styles from '../style.module.scss';

export default function Header() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const tooltipProps = useGlobalTooltip((state) => state.tooltipProps);
  const NoSSRProfile = dynamic(
    () => import('.').then((modules) => modules.ProfileLinkAvatar),
    { ssr: false },
  );

  // This block prevents hydration render mismatch from persisted user store
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (router.pathname === '/') return <></>;

  const isGuest = hasHydrated && !user;

  return (
    <div className={styles.header}>
      <Link href={isGuest ? '/' : '/dashboard'} className={styles.home}>
        <Influences />
        <span>Mapper Influences</span>
      </Link>
      <SearchBar className={styles.searchBar} />
      <Link
        href="/graph"
        className={styles.graphLink}
        aria-label="Influence graph"
        {...tooltipProps('Influence graph')}
      >
        <Graph />
      </Link>
      <DarkModeToggle className={styles.darkMode} />
      {isGuest ? (
        <a className={styles.login} href={getOsuAuthUrl()}>
          Log In
        </a>
      ) : (
        <NoSSRProfile user={user} />
      )}
    </div>
  );
}

export const ProfileLinkAvatar: FC<{ user?: UserSmall }> = ({ user }) => (
  <Link href={'/profile'}>
    <ProfilePhoto
      className={styles.avatar}
      photoUrl={user?.avatar_url}
      size="md"
      circle
    />
  </Link>
);
