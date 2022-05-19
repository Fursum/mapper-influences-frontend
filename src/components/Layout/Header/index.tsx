import DarkModeToggle from "@components/DarkModeToggle";
import ProfilePhoto from "@components/ProfilePhoto";
import Link from "next/link";
import { useAppSelector } from "src/redux/hooks";
import SearchBar from "../../SearchBar";
import styles from "./style.module.scss";

export default function Header() {
  const currentUser = useAppSelector((s) => s.user.currentUser.data);

  return (
    <div className={styles.header}>
      <SearchBar className={styles.searchBar} />
      <DarkModeToggle className={styles.darkMode} />
      <Link href={"/profile"} passHref>
        <a>
          <ProfilePhoto
            className={styles.avatar}
            photoUrl={currentUser?.avatarUrl}
            size="md"
          />
        </a>
      </Link>
    </div>
  );
}
