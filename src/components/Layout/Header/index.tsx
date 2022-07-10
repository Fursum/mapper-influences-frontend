import Link from "next/link";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "src/redux/hooks";
import { getCurrentUser } from "src/redux/User/action";
import DarkModeToggle from "@components/SharedComponents/DarkModeToggle";
import ProfilePhoto from "@components/SharedComponents/ProfilePhoto";
import SearchBar from "../../SharedComponents/SearchBar";
import styles from "../style.module.scss";

export default function Header() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.user.currentUser.data);

  useEffect(() => {
    dispatch(getCurrentUser("1234"));
  }, [dispatch]);

  return (
    <div className={styles.header}>
      <Link href="/" passHref>
        <a className={styles.home}>Mapper Influences</a>
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
