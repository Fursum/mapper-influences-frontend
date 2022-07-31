import ProfilePhoto from "@components/SharedComponents/ProfilePhoto";
import Link from "next/link";
import React, { FC, useEffect } from "react";
import { UserBase } from "@libs/types/user";
import Pill from "./Pill";
import Image from "next/image";
import useWindowSize from "@hooks/useWindowSize";

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
  const debounceFitText = AwesomeDebouncePromise(runFitText, 2000);

  const windowSize = useWindowSize();
  // Fit text to card
  useEffect(() => {
    if (document) runFitText();
  }, []);
  useEffect(() => {
    if (document) debounceFitText();
  }, [windowSize]);

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
