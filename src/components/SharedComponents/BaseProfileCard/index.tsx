import ProfilePhoto from "@components/SharedComponents/ProfilePhoto";
import Link from "next/link";
import React, { FC, useEffect, useState } from "react";
import { UserBase } from "@libs/types/user";
import Pill from "./Pill";
import Image from "next/image";

import styles from "./style.module.scss";
import AwesomeDebouncePromise from "awesome-debounce-promise";

const textFit = require("textfit");

type Props = { userData: UserBase };

const BaseProfileCard: FC<Props> = ({ userData }) => {
  const Pills = userData.groups?.map((group) => (
    <Pill key={group.id} group={group} />
  ));

  const runFitText = () =>
    textFit(document.getElementsByClassName(styles.name));
  // Random delay so every fit text does not run at once

  // Fit text to card on resize
  useEffect(() => {
    const debounceFitText = AwesomeDebouncePromise(
      runFitText,
      //Add random delay to updates
      1000 + Math.random() * 10
    );
    if (document) runFitText();
    window.addEventListener("resize", debounceFitText);
    return () => {
      window.removeEventListener("resize", debounceFitText);
    };
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
