import { FC } from "react";

type Props = { color?: string; className?: string };
const Pending: FC<Props> = ({ color = "var(--textColor)", className }) => {
  return (
    <svg
      className={className}
      width="82"
      height="22"
      viewBox="0 0 82 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 11C22 17.0751 17.0751 22 11 22C4.92487 22 0 17.0751 0 11C0 4.92487 4.92487 0 11 0C17.0751 0 22 4.92487 22 11Z"
        fill={color}
      />
      <path
        d="M52 11C52 17.0751 47.0751 22 41 22C34.9249 22 30 17.0751 30 11C30 4.92487 34.9249 0 41 0C47.0751 0 52 4.92487 52 11Z"
        fill={color}
      />
      <path
        d="M82 11C82 17.0751 77.0751 22 71 22C64.9249 22 60 17.0751 60 11C60 4.92487 64.9249 0 71 0C77.0751 0 82 4.92487 82 11Z"
        fill={color}
      />
    </svg>
  );
};
export default Pending;
