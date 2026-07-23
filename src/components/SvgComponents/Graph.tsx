import type { FC } from "react";

type Props = { color?: string; className?: string };
const Graph: FC<Props> = ({ color = "var(--textColor)", className }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.5 12L5.5 5.5M11.5 12L19 7M11.5 12L14.5 19.5"
        stroke={color}
        strokeWidth="1.75"
      />
      <circle cx="5" cy="5" r="3" fill={color} />
      <circle cx="19.5" cy="6.5" r="2.5" fill={color} />
      <circle cx="15" cy="20" r="2.75" fill={color} />
      <circle cx="11.5" cy="12" r="3.5" fill={color} />
    </svg>
  );
};
export default Graph;
