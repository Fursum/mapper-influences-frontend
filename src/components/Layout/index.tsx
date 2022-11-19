import React, { FC, ReactNode } from "react";
import Header from "./Header";

import styles from "./style.module.scss";

type Props = {
  children?: ReactNode;
};

const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      {<Header />}
      <main className={styles.contentCenterer}>{children}</main>
    </>
  );
};

export default Layout;
