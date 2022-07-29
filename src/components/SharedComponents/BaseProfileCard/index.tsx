import ProfilePhoto from "@components/SharedComponents/ProfilePhoto";
import Link from "next/link";
import React, { FC, useEffect } from "react";
import { UserBase } from "@libs/types/user";

import styles from "./style.module.scss";
import Pill from "./Pill";
import Image from "next/image";
const textFit = require("textfit");

type Props = { userData: UserBase };

const BaseProfileCard: FC<Props> = ({ userData }) => {
  const Pills = userData.groups?.map((group) => (
    <Pill key={group.id} group={group} />
  ));

  // Fit text to card
  useEffect(() => {
    if (document) textFit(document.getElementsByClassName(styles.name));
  }, []);

  return (
    <Link href={`/profile/${userData.id}`} passHref={true}>
      <div className={styles.cardWrapper}>
        <div className={styles.photo}>
          <Image src={userData.avatarUrl} alt="Profile photo" layout="fill" />
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
