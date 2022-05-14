import Image from "next/image";
import styles from "./styles.module.scss";

interface Props {
  photoUrl: string | undefined;
  size: "md" | "lg";
}

export default function ProfilePhoto({ photoUrl, size }: Props) {
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
