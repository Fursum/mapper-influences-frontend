import ProfilePage from '@components/PageComponents/ProfilePage';
import useAuth from '@hooks/useAuth';
import type { NextPage } from 'next';
import Head from 'next/head';

const MapperPage: NextPage = () => {
  useAuth();

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
