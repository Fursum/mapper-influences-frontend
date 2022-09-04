import Link from "next/link";
import { useAppSelector } from "src/redux/hooks";
import DarkModeToggle from "@components/Layout/Header/DarkModeToggle";
import ProfilePhoto from "@components/SharedComponents/ProfilePhoto";
import SearchBar from "./SearchBar";
import styles from "../style.module.scss";
import { Influences } from "@components/SvgComponents";

export default function Header() {
  const currentUser = useAppSelector((s) => s.user.currentUser.data);

  if (!currentUser) return null;

  return (
    <div className={styles.header}>
      <Link href="/" passHref>
        <a className={styles.home}>
          <Influences />
          <span>Mapper Influences</span>
        </a>
      </Link>
      <SearchBar className={styles.searchBar} />
      <DarkModeToggle className={styles.darkMode} />
      <Link href={"/profile"} passHref>
        <a>
          <ProfilePhoto
            className={styles.avatar}
            photoUrl={currentUser?.avatarUrl}
            size="md"
            circle
          />
        </a>
      </Link>
    </div>
  );
}
