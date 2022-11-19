import Link from "next/link";
import DarkModeToggle from "@components/Layout/Header/DarkModeToggle";
import ProfilePhoto from "@components/SharedComponents/ProfilePhoto";
import SearchBar from "./SearchBar";
import { Influences } from "@components/SvgComponents";
import { useSessionStore } from "states/user";
import styles from "../style.module.scss";

export default function Header() {
  const { user } = useSessionStore();

  if (!user) return null;

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
            photoUrl={user.avatarUrl}
            size="md"
            circle
          />
        </a>
      </Link>
    </div>
  );
}
