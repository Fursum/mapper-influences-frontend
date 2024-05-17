import { useEffect } from 'react';

import ProfilePage from '@components/PageComponents/ProfilePage';
import useAuth from '@hooks/useAuth';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';

const MapperPage: NextPage = () => {
  const router = useRouter();

  useAuth();

  useEffect(() => {
    router.prefetch('/dashboard');
  }, []);

  return <ProfilePage />;
};

export default MapperPage;
