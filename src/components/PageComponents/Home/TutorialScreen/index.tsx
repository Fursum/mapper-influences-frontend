import SearchBar from "@components/Layout/Header/SearchBar";
import EditableDescription from "@components/PageComponents/ProfilePage/EditableDescription";
import InfluenceType from "@components/PageComponents/ProfilePage/InfluenceList/InfluenceType";
import AddUserButton from "@components/PageComponents/ProfilePage/MapperDetails/AddUserButton";
import BaseProfileCard from "@components/SharedComponents/BaseProfileCard";
import { Influence, InfluenceTypeEnum } from "@libs/types/influence";
import { FC, ReactNode, useState } from "react";

import styles from "./style.module.scss";

const TutorialStep: FC<{
  number: number;
  title: string;
  children: ReactNode;
}> = ({ number, title, children }) => {
  return (
    <div className={styles.tutorialStep}>
      <h3>{`${number}. ${title}`}</h3>
      <div className={styles.centerer}>{children}</div>
    </div>
  );
};

type Props = { children?: ReactNode };
const TutorialScreen: FC<Props> = ({ children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const toggleTooltip = () => {
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 3000);
  };

  const influenceData: Influence = {
    description: "Edit here to give details.",
    lastUpdated: new Date().getDate(),
    profileData: {
      avatarUrl: "https://a.ppy.sh/4865030?1650115534.jpeg",
      username: "Fursum",
      id: 1234,
    },
    strength: 1,
    type: InfluenceTypeEnum.Respect,
  };

  return (
    <div className={styles.tutorialWrapper}>
      <h1>Getting Started:</h1>
      <div className={styles.stepsWrapper}>
        <TutorialStep
          number={1}
          title={"Look up someone who inspired your mapping"}
        >
          <div className={styles.searchWrapper}>
            <SearchBar />
          </div>
        </TutorialStep>
        <TutorialStep number={2} title={"Add the user to your influences list"}>
          <AddUserButton onClick={toggleTooltip} />
          {showTooltip && (
            <span className={styles.addButtonTooltip}>
              You need to click this inside a profile. <br />
              Search someone first!
            </span>
          )}
        </TutorialStep>

        <TutorialStep
          number={3}
          title={"In your profile, describe how the mapper influenced you"}
        >
          <div className={styles.profileSide}>
            <BaseProfileCard userData={influenceData.profileData} />
            <InfluenceType editable />
          </div>
          <div className={styles.descriptionSide}>
            <EditableDescription
              description="Edit here to give more details."
              editable
            />
          </div>
        </TutorialStep>
      </div>
      {children}
    </div>
  );
};
export default TutorialScreen;
