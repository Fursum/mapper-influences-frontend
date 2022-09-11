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
      {<Header />}
      <div className={styles.contentCenterer}>
        <main className={styles.contentWrapper}>{children}</main>
      </div>
    </>
  );
};

export default Layout;
