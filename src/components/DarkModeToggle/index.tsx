import useToggleDarkMode from "@hooks/useToggleDarkMode";
import React, { FC, useEffect } from "react";

type Props = {};

const DarkModeToggle: FC<Props> = ({}) => {
  const [currentMode, setMode] = useToggleDarkMode();

  const toggleMode = () => {
    setMode(currentMode === "dark" ? "light" : "dark");
  };

  return <button onClick={toggleMode}>Toggle Dark Mode</button>;
};

export default DarkModeToggle;
