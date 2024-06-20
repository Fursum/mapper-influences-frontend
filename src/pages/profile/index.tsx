import { useEffect } from 'react';

import ProfilePage from '@components/PageComponents/ProfilePage';
import useAuth from '@hooks/useAuth';
import { useCurrentUser } from '@services/user';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const MapperPage: NextPage = () => {
  useAuth();
  const router = useRouter();
  const { data } = useCurrentUser();

  useEffect(() => {
    if (!data) return;
    router.push(`/profile/${data?.id}`);
  }, [data, router.push]);

  return (
    <>
      <Head>
        <meta name="description" content={'Your own profile page.'} />
        <title>{'My Profile - Mapper Influences'}</title>
      </Head>
      <ProfilePage />
    </>
  );
};

export default MapperPage;
