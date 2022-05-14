import React, { FC, ReactNode } from "react";
import Header from "./Header";

type Props = {
  children?: ReactNode;
};

const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default Layout;
