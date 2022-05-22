import Image from "next/image";
import { FC } from "react";
import styles from "./style.module.scss";

type Props = {
  photoUrl?: string;
  size: "md" | "lg" | "xl";
  className?: string;
  circle?: boolean;
};

const ProfilePhoto: FC<Props> = ({ photoUrl, size, className, circle }) => {
  return (
    <div
      className={`${styles.wrapper} ${styles[size]} ${className} ${
        circle ? styles.circle : ""
      }`}
    >
      <Image
        src={photoUrl || "/defaultAvatar.png"}
        alt="Avatar Image"
        layout="fill"
      />
    </div>
  );
};

export default ProfilePhoto;
