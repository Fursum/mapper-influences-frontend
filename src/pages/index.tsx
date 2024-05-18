import { LoginScreen } from '@components/PageComponents/Home';
import useAuth from '@hooks/useAuth';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  useAuth();

  return <LoginScreen />;
};

export default Home;
