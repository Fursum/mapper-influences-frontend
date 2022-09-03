import Link from "next/link";
import React, { FC, useEffect } from "react";
import { UserBase } from "@libs/types/user";
import Badge from "./Badge";
import Image from "next/image";

import styles from "./style.module.scss";
import AwesomeDebouncePromise from "awesome-debounce-promise";

const textFit = require("textfit");

type Props = { userData: UserBase };

const BaseProfileCard: FC<Props> = ({ userData }) => {
  const Badges = userData.groups?.map((group) => (
    <Badge key={group.id} group={group} />
  ));

  const runFitText = () =>
    textFit(document.getElementsByClassName(styles.name));

  // Fit text to card on resize and on mount
  useEffect(() => {
    document.fonts.ready.then(() => runFitText());

    const debounceFitText = AwesomeDebouncePromise(
      runFitText,
      //Add random delay to updates
      50 + Math.random() * 15
    );
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
          <div className={styles.badges}>{Badges}</div>
        </div>
      </div>
    </Link>
  );
};

export default BaseProfileCard;
