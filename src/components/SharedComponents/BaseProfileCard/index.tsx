import ProfilePhoto from "@components/SharedComponents/ProfilePhoto";
import Link from "next/link";
import React, { FC, useEffect } from "react";
import { UserBase } from "@libs/types/user";

import styles from "./style.module.scss";
import Pill from "./Pill";
const textFit = require("textfit");

type Props = { userData: UserBase };

const BaseProfileCard: FC<Props> = ({ userData }) => {
  const Pills = userData.groups?.map((group) => (
    <Pill key={group.id} group={group} />
  ));

  useEffect(() => {
    if (document) textFit(document.getElementsByClassName(styles.name));
  }, []);

  return (
    <Link href={`/profile/${userData.id}`} passHref={true}>
      <div className={styles.cardWrapper}>
        <div className={styles.photo}>
          <ProfilePhoto photoUrl={userData.avatarUrl} size="lg" />
        </div>
        <div className={styles.rightSide}>
          <div className={styles.name}>{userData.username}</div>
          <div className={styles.pills}>{Pills}</div>
        </div>
      </div>
    </Link>
  );
};

export default BaseProfileCard;
