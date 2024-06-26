import type { FC } from "react";

type Props = { color?: string; className?: string };
const Graved: FC<Props> = ({ color = "var(--textColor)", className }) => {
  return (
    <svg
      className={className}
      width="67"
      height="74"
      viewBox="0 0 67 74"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M67 33.5C67 33.667 66.9988 33.8336 66.9963 34H67V74H0V34H0.0036555C0.00122132 33.8336 0 33.667 0 33.5C0 14.9985 14.9985 0 33.5 0C52.0015 0 67 14.9985 67 33.5ZM28 18H38V30H48V39H38V62H28V39H18V30H28V18Z"
        fill={color}
      />
    </svg>
  );
};
export default Graved;
