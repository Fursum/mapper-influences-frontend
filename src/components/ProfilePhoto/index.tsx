import Image from "next/image";
import { FC } from "react";
import styles from "./style.module.scss";

type Props = {
  photoUrl?: string;
  size: "md" | "lg";
  className?: string;
}

const ProfilePhoto:FC<Props> = ({ photoUrl, size }) => {
  return (
    <div className={`${styles.wrapper} ${styles[size]}`}>
      <Image
        src={photoUrl || "/defaultAvatar.png"}
        alt="Avatar Image"
        layout="fill"
      />
    </div>
  );
}

export default ProfilePhoto