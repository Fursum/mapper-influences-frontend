import ProfilePhoto from "@components/SharedComponents/ProfilePhoto";
import Link from "next/link";
import React, { FC } from "react";
import { UserBase } from "@libs/types/user";

import styles from "./style.module.scss";

type Props = { userData: UserBase };

const BaseProfileCard: FC<Props> = ({ userData }) => {
  return (
    <Link href={`/profile/${userData.id}`} passHref={true}>
      <div className={styles.cardWrapper}>
        <div className={styles.photo}>
          <ProfilePhoto photoUrl={userData.avatarUrl} size="lg" />
        </div>
        <span className={styles.name}>{userData.username}</span>
      </div>
    </Link>
  );
};

export default BaseProfileCard;
