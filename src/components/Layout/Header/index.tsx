import Link from "next/link";
import DarkModeToggle from "@components/Layout/Header/DarkModeToggle";
import ProfilePhoto from "@components/SharedComponents/ProfilePhoto";
import SearchBar from "./SearchBar";
import { Influences } from "@components/SvgComponents";
import { useSessionStore } from "src/states/user";
import styles from "../style.module.scss";
import { FC, useEffect, useState } from "react";
import { UserBase } from "@libs/types/user";
import dynamic from "next/dynamic";

export default function Header() {
  const { user } = useSessionStore();
  const NoSSRProfile = dynamic(
    () => import(".").then((modules) => modules.ProfileLinkAvatar),
    { ssr: false }
  );

  // This block prevents hydration render mismatch from persisted user store
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (hasHydrated && !user) return <></>;

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
      <NoSSRProfile user={user} />
    </div>
  );
}

export const ProfileLinkAvatar: FC<{ user?: UserBase }> = ({ user }) => (
  <Link href={"/profile"} passHref>
    <a>
      <ProfilePhoto
        className={styles.avatar}
        photoUrl={user?.avatarUrl}
        size="md"
        circle
      />
    </a>
  </Link>
);
