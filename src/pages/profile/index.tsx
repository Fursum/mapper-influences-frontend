import { useEffect } from 'react';

import ProfilePage from '@components/PageComponents/ProfilePage';
import useAuth from '@hooks/useAuth';
import { useCurrentUser } from '@hooks/useUser';
import type { NextPage } from 'next';
import Head from 'next/head';

const MapperPage: NextPage = () => {
  useAuth();

  const { data: currentUser } = useCurrentUser();

  return (
    <>
      <Head>
        <meta name="description" content={`Your own profile page.`} />
        <title>{`${currentUser?.username} - Mapper Influences`}</title>
      </Head>
      <ProfilePage />
    </>
  );
};

export default MapperPage;
