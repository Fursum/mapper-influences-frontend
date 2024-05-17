import type { FC, ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Tooltip from '@components/SharedComponents/Tooltip';
import '@fontsource-variable/comfortaa';
import '@fontsource-variable/inter';
import { useCurrentUser } from '@hooks/useUser';
import { useGlobalTheme } from '@states/theme';

import Header from './Header';

import styles from './style.module.scss';

type Props = {
  children?: ReactNode;
};

const Layout: FC<Props> = ({ children }) => {
  const { data: user } = useCurrentUser(); // Just to fetch the user data

  const { theme } = useGlobalTheme();
  return (
    <>
      {<Header />}
      <main className={styles.contentCenterer}>{children}</main>
      <Tooltip />
      <ToastContainer theme={theme} position="bottom-right" />
    </>
  );
};

export default Layout;
