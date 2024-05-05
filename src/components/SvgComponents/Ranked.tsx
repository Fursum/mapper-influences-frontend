import type { FC } from "react";

type Props = { color?: string; className?: string };
const Ranked: FC<Props> = ({ color = "var(--textColor)", className }) => {
  return (
    <svg
      className={className}
      width="76"
      height="69"
      viewBox="0 0 76 69"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 69L38 38.1529L76 69V56.0118L38 25.1647L0 56.0118V69Z"
        fill={color}
      />
      <path
        d="M0 43.8353V30.8471L38 0L76 30.8471V43.8353L38 12.9882L0 43.8353Z"
        fill={color}
      />
    </svg>
  );
};
export default Ranked;
