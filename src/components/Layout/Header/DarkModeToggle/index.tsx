import type { FC } from "react";

import { Beams } from "@components/SvgComponents";
import { toggleTheme, useGlobalTheme } from "@states/theme";

import styles from "./style.module.scss";

type Props = {
  className?: string;
};

const DarkModeToggle: FC<Props> = ({ className }) => {
  const theme = useGlobalTheme((state) => state.theme);

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      className={`${styles.outerSlider} ${className}`}
      onClick={toggleTheme}
    >
      <div className={`${styles.innerSlider} ${styles[theme]}`}>
        <div className={styles.colorFill} />
        <Beams className={styles.beam} color={"var(--buttonText)"} />
      </div>
    </button>
  );
};

export default DarkModeToggle;
