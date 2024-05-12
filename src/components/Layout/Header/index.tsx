import DarkModeToggle from "@components/Layout/Header/DarkModeToggle";
import ProfilePhoto from "@components/SharedComponents/ProfilePhoto";
import { Influences } from "@components/SvgComponents";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FC, useEffect, useState } from "react";

import styles from "../style.module.scss";
import SearchBar from "./SearchBar";
import type { CurrentUserResponse } from "@services/user";
import { useCurrentUser } from "@hooks/useUser";

export default function Header() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const NoSSRProfile = dynamic(
    () => import(".").then((modules) => modules.ProfileLinkAvatar),
    { ssr: false }
  );

  // This block prevents hydration render mismatch from persisted user store
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (router.pathname === "/") return <></>;
  if (hasHydrated && !user) return <></>;

  return (
    <div className={styles.header}>
      <Link href="/dashboard" className={styles.home}>
        <Influences />
        <span>Mapper Influences</span>
      </Link>
      <SearchBar className={styles.searchBar} />
      <DarkModeToggle className={styles.darkMode} />
      <NoSSRProfile user={user} />
    </div>
  );
}

export const ProfileLinkAvatar: FC<{ user?: CurrentUserResponse }> = ({
  user,
}) => (
  <Link href={"/profile"}>
    <ProfilePhoto
      className={styles.avatar}
      photoUrl={user?.avatar_url}
      size="md"
      circle
    />
  </Link>
);
