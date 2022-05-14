import useDarkMode from "@hooks/useDarkMode";
import React, { FC, useEffect } from "react";

import styles from "./style.module.scss";

type Props = {};

const DarkModeToggle: FC<Props> = ({}) => {
  const [currentMode, setMode] = useDarkMode();

  const toggleMode = () => {
    setMode(currentMode === "dark" ? "light" : "dark");
  };

  return (
    <button className={styles.outerSlider} onClick={toggleMode}>
      <div className={`${styles.innerSlider} ${styles[currentMode]}`} />
    </button>
  );
};

export default DarkModeToggle;
