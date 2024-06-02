import { useEffect } from 'react';

import ProfilePage from '@components/PageComponents/ProfilePage';
import useAuth from '@hooks/useAuth';
import {
  type UserBioResponse,
  getUserBio,
  useCurrentUser,
  useFullUser,
} from '@services/user';
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const MapperPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ cachedBio }) => {
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
        <title>{`${cachedBio?.username ?? profileData?.username ?? 'Profile'} - Mapper Influences`}</title>
        {cachedBio && (
          <meta
            name="description"
            content={`Check out the influences of ${cachedBio?.username}.`}
          />
        )}
      </Head>
      <ProfilePage userId={mapperId?.toString()} />
    </>
  );
};

export default MapperPage;

// get user bio from dynamic values with types

export const getServerSideProps: GetServerSideProps<{
  cachedBio?: UserBioResponse;
}> = async (context) => {
  if (!context.preview) return { props: {} };

  let userBio: UserBioResponse | undefined;

  try {
    userBio = await getUserBio(context.params?.mapperId as string);
  } catch (e) {
    return {
      props: {},
    };
  }

  return {
    props: {
      cachedBio: userBio,
    },
  };
};
