import { FC } from "react";

type Props = { color?: string; className?: string };
const Followers: FC<Props> = ({ color = "var(--textColor)", className }) => {
  return (
    <svg
      className={className}
      width="38"
      height="44"
      viewBox="0 0 38 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M38 43.5769C38 36.7935 35.9982 30.2879 32.435 25.4913C28.8718 20.6947 24.0391 18 19 18C13.9609 18 9.12816 20.6947 5.56497 25.4913C2.00178 30.2879 7.60885e-07 36.7935 0 43.5769L38 43.5769Z"
        fill={color}
      />
      <path
        d="M28.2564 9.01282C28.2564 13.9905 24.2212 18.0256 19.2436 18.0256C14.2659 18.0256 10.2308 13.9905 10.2308 9.01282C10.2308 4.03518 14.2659 0 19.2436 0C24.2212 0 28.2564 4.03518 28.2564 9.01282Z"
        fill={color}
      />
    </svg>
  );
};
export default Followers;
