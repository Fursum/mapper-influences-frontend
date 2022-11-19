import Link from "next/link";
import React, { FC, useEffect } from "react";
import { UserBase } from "@libs/types/user";
import Badge from "./Badge";
import AwesomeDebouncePromise from "awesome-debounce-promise";
const textFit = require("textfit");

import styles from "./style.module.scss";

type Props = { userData: UserBase };

const BaseProfileCard: FC<Props> = ({ userData }) => {
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

  const Badges = userData.groups?.map((group) => (
    <Badge key={group.id} group={group} />
  ));

  return (
    <Link href={`/profile/${userData.id}`} passHref={true}>
      <div className={styles.cardWrapper} tabIndex={0}>
        <img
          src={userData.avatarUrl}
          alt="Profile photo"
          className={styles.photo}
        />
        <div className={styles.rightSide}>
          <div className={styles.name}>{userData.username}</div>
          {Badges?.length && <div className={styles.badges}>{Badges}</div>}
        </div>
      </div>
    </Link>
  );
};

export default BaseProfileCard;
