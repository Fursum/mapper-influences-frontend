import ProfilePage from '@components/PageComponents/ProfilePage';
import useAuth from '@hooks/useAuth';
import type { NextPage } from 'next';

const MapperPage: NextPage = () => {
  useAuth();

  return <ProfilePage />;
};

export default MapperPage;
