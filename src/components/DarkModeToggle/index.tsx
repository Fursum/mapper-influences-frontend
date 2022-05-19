import useDarkMode from "@hooks/useDarkMode";
import React, { FC } from "react";

import styles from "./style.module.scss";

type Props = {
  className?: string;
};

const DarkModeToggle: FC<Props> = ({className}) => {
  const [currentMode, setMode] = useDarkMode();

  const toggleMode = () => {
    setMode(currentMode === "dark" ? "light" : "dark");
  };

  return (
    <button className={`${styles.outerSlider} ${className}`} onClick={toggleMode}>
      <div className={`${styles.innerSlider} ${styles[currentMode]}`} />
    </button>
  );
};

export default DarkModeToggle;
