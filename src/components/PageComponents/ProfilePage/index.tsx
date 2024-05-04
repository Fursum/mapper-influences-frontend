import { useCurrentUser } from "@hooks/useUser";
import { useGetInfluences } from "@services/influence";
import { useFullUser } from "@services/user";
import { useRouter } from "next/router";
import { FC, useState } from "react";

import InfluenceList from "./InfluenceList";
import MapperDetails from "./MapperDetails";
import MentionList from "./MentionList";
import styles from "./style.module.scss";

type Props = { userId?: number | string };

const ProfilePage: FC<Props> = ({ userId }) => {
  const { logout } = useCurrentUser();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"influences" | "mentions">(
    "influences"
  );
  
  const isUser = router.asPath === "/profile";

  return (
    <div className={styles.profilePage}>
      <MapperDetails userId={userId} />

      <div className={styles.buttons}>
        <button
          className={selectedTab === "influences" ? styles.selected : ""}
          onClick={() => setSelectedTab("influences")}>
          Influences
        </button>
        <button
          className={selectedTab === "mentions" ? styles.selected : ""}
          onClick={() => setSelectedTab("mentions")}>
          Mentions
        </button>
      </div>
      <div className={styles.content}>
        <MentionList mentions={[]} open={selectedTab === "mentions"} />
        <InfluenceList userId={userId} open={selectedTab === "influences"} />
      </div>
      {isUser && <button onClick={logout}>Sign out</button>}
    </div>
  );
};

export default ProfilePage;
