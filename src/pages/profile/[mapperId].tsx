import { useEffect } from 'react';

import ProfilePage from '@components/PageComponents/ProfilePage';
import useAuth from '@hooks/useAuth';
import { useCurrentUser, useFullUser } from '@services/user';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const MapperPage: NextPage = () => {
  useAuth();
  const router = useRouter();
  const { mapperId } = router.query;

  const { data: currentUser } = useCurrentUser();
  const {
    error,
    isLoading,
    data: profileData,
  } = useFullUser(mapperId?.toString());

  if (!isLoading && error && mapperId) {
    router.push('/404');
  }

  useEffect(() => {
    if (currentUser && mapperId?.toString() === currentUser?.id.toString())
      router.replace('/profile');
  }, [mapperId, currentUser, router]);

  return (
    <>
      <Head>
        {profileData && (
          <title>{`${profileData?.username} - Mapper Influences`}</title>
        )}
        <meta
          name="description"
          content={'Check out the influences of a mapper.'}
        />
      </Head>
      <ProfilePage userId={mapperId?.toString()} />
    </>
  );
};

export default MapperPage;
