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
  const { data: mapper, error } = useFullUser(mapperId?.toString());

  if (error && mapperId) {
    router.push('/404');
  }

  useEffect(() => {
    if (currentUser && mapperId?.toString() === currentUser?.id.toString())
      router.replace('/profile');
  }, [mapperId, currentUser, router]);

  return (
    <>
      {mapper && mapperId && (
        <Head>
          <meta
            name="description"
            content={`Profile page of ${mapper?.username}.`}
          />
          <title>{`${mapper?.username} - Mapper Influences`}</title>
        </Head>
      )}
      {!mapperId && (
        <Head>
          <meta name="description" content={'Your own profile page.'} />
          <title>{`${currentUser?.username} - Mapper Influences`}</title>
        </Head>
      )}
      <ProfilePage userId={mapperId?.toString()} />
    </>
  );
};

export default MapperPage;
