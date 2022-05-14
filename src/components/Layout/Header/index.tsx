import DarkModeToggle from "@components/DarkModeToggle";
import ProfilePhoto from "@components/ProfilePhoto";
import { useAppSelector } from "src/redux/hooks";
import SearchBar from "../../SearchBar";
import styles from "./style.module.scss";

export default function Header() {
  const currentUser = useAppSelector((s) => s.user.currentUser.data);

  return (
    <div className={styles.header}>
      <SearchBar />
      <DarkModeToggle />
      <ProfilePhoto photoUrl={currentUser?.details?.avatarUrl} size="md" />
    </div>
  );
}
