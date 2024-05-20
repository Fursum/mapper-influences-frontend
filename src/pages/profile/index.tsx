import ProfilePage from '@components/PageComponents/ProfilePage';
import useAuth from '@hooks/useAuth';
import type { NextPage } from 'next';
import Head from 'next/head';

const MapperPage: NextPage = () => {
  useAuth();

  return (
    <>
      <Head>
        <title>{'Mapper Influences'}</title>
        <meta name="description" content={'Your own profile page.'} />
      </Head>
      <ProfilePage />
    </>
  );
};

export default MapperPage;
