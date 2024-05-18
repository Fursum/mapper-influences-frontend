import type { FC } from "react";

type Props = { color?: string; className?: string };
const Arrow: FC<Props> = ({ color = "var(--textColor)", className }) => {
  return (
    <svg
      width="29"
      height="42"
      viewBox="0 0 29 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.46449 17.0625L0.928955 20.598L4.46449 24.1335L8.00002 27.6691L20.0625 39.7315C22.0151 41.6842 25.1809 41.6842 27.1336 39.7315C29.0862 37.7789 29.0862 34.6131 27.1336 32.6605L15.0711 20.598L27.1336 8.53553C29.0862 6.58291 29.0862 3.41709 27.1336 1.46447C25.1809 -0.488156 22.0151 -0.488155 20.0625 1.46447L8.00002 13.5269L4.46449 17.0625Z"
        fill={color}
      />
    </svg>
  );
};

export default Arrow;
