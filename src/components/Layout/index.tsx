import React, { FC, ReactNode } from "react";
import { useAppSelector } from "src/redux/hooks";
import Header from "./Header";

import styles from "./style.module.scss";

type Props = {
  children?: ReactNode;
};

const Layout: FC<Props> = ({ children }) => {
  const session = useAppSelector((s) => s.session);
  return (
    <>
      {session && <Header />}
      <main className={styles.contentCenterer}>{children}</main>
    </>
  );
};

export default Layout;
