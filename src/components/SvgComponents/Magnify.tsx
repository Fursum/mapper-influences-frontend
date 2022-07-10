import { FC } from "react";

type Props = { color?: string; className?: string };
const Magnify: FC<Props> = ({ color = "var(--textColor)", className }) => {
  return (
    <svg
      className={className}
      width="19"
      height="25"
      viewBox="0 0 19 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.5">
        <mask id="path-1-inside-1_1314_341">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M18.7393 8.36957C18.7393 12.9919 14.9921 16.7391 10.3697 16.7391C9.51391 16.7391 8.68813 16.6107 7.91057 16.372L3.72553 23.5114C3.16694 24.4643 1.94162 24.784 0.988708 24.2254C0.035791 23.6668 -0.283874 22.4415 0.274717 21.4886L4.47947 14.3156C2.94846 12.7988 2.00013 10.6949 2.00013 8.36957C2.00013 3.74718 5.74731 0 10.3697 0C14.9921 0 18.7393 3.74718 18.7393 8.36957ZM10.3697 13.6956C13.3112 13.6956 15.6958 11.3111 15.6958 8.36954C15.6958 5.42803 13.3112 3.04346 10.3697 3.04346C7.42815 3.04346 5.04358 5.42803 5.04358 8.36954C5.04358 11.3111 7.42815 13.6956 10.3697 13.6956Z"
          />
        </mask>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18.7393 8.36957C18.7393 12.9919 14.9921 16.7391 10.3697 16.7391C9.51391 16.7391 8.68813 16.6107 7.91057 16.372L3.72553 23.5114C3.16694 24.4643 1.94162 24.784 0.988708 24.2254C0.035791 23.6668 -0.283874 22.4415 0.274717 21.4886L4.47947 14.3156C2.94846 12.7988 2.00013 10.6949 2.00013 8.36957C2.00013 3.74718 5.74731 0 10.3697 0C14.9921 0 18.7393 3.74718 18.7393 8.36957ZM10.3697 13.6956C13.3112 13.6956 15.6958 11.3111 15.6958 8.36954C15.6958 5.42803 13.3112 3.04346 10.3697 3.04346C7.42815 3.04346 5.04358 5.42803 5.04358 8.36954C5.04358 11.3111 7.42815 13.6956 10.3697 13.6956Z"
          fill={color}
        />
        <path
          d="M7.91057 16.372L8.20398 15.4161L7.44785 15.184L7.04786 15.8663L7.91057 16.372ZM3.72553 23.5114L2.86283 23.0057L2.86283 23.0057L3.72553 23.5114ZM0.988708 24.2254L0.482998 25.0881L0.482999 25.0881L0.988708 24.2254ZM0.274717 21.4886L1.13742 21.9943L1.13742 21.9943L0.274717 21.4886ZM4.47947 14.3156L5.34217 14.8213L5.73477 14.1515L5.18326 13.6052L4.47947 14.3156ZM10.3697 17.7391C15.5444 17.7391 19.7393 13.5442 19.7393 8.36957H17.7393C17.7393 12.4397 14.4398 15.7391 10.3697 15.7391V17.7391ZM7.61715 17.328C8.48872 17.5955 9.41335 17.7391 10.3697 17.7391V15.7391C9.61447 15.7391 8.88754 15.6259 8.20398 15.4161L7.61715 17.328ZM4.58824 24.0171L8.77327 16.8777L7.04786 15.8663L2.86283 23.0057L4.58824 24.0171ZM0.482999 25.0881C1.91237 25.926 3.75035 25.4465 4.58824 24.0171L2.86283 23.0057C2.58353 23.4822 1.97087 23.642 1.49442 23.3627L0.482999 25.0881ZM-0.587987 20.9829C-1.42587 22.4122 -0.946375 24.2502 0.482998 25.0881L1.49442 23.3627C1.01796 23.0834 0.858127 22.4707 1.13742 21.9943L-0.587987 20.9829ZM3.61677 13.8099L-0.587988 20.9829L1.13742 21.9943L5.34217 14.8213L3.61677 13.8099ZM1.00013 8.36957C1.00013 10.9725 2.06288 13.3291 3.77568 15.026L5.18326 13.6052C3.83403 12.2685 3.00013 10.4174 3.00013 8.36957H1.00013ZM10.3697 -1C5.19502 -1 1.00013 3.1949 1.00013 8.36957H3.00013C3.00013 4.29947 6.29959 1 10.3697 1V-1ZM19.7393 8.36957C19.7393 3.1949 15.5444 -1 10.3697 -1V1C14.4398 1 17.7393 4.29947 17.7393 8.36957H19.7393ZM14.6958 8.36954C14.6958 10.7588 12.7589 12.6956 10.3697 12.6956V14.6956C13.8635 14.6956 16.6958 11.8633 16.6958 8.36954H14.6958ZM10.3697 4.04346C12.7589 4.04346 14.6958 5.98031 14.6958 8.36954H16.6958C16.6958 4.87574 13.8635 2.04346 10.3697 2.04346V4.04346ZM6.04358 8.36954C6.04358 5.98031 7.98044 4.04346 10.3697 4.04346V2.04346C6.87587 2.04346 4.04358 4.87574 4.04358 8.36954H6.04358ZM10.3697 12.6956C7.98044 12.6956 6.04358 10.7588 6.04358 8.36954H4.04358C4.04358 11.8633 6.87587 14.6956 10.3697 14.6956V12.6956Z"
          fill={color}
          mask="url(#path-1-inside-1_1314_341)"
        />
      </g>
    </svg>
  );
};
export default Magnify;