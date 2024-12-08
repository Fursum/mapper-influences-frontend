import type { FC, ReactNode } from 'react';

import SearchBar from '@components/Layout/Header/SearchBar';
import EditableDescription from '@components/PageComponents/ProfilePage/EditableDescription';
import InfluenceType from '@components/PageComponents/ProfilePage/InfluenceList/InfluenceType';
import AddUserButton from '@components/PageComponents/ProfilePage/MapperDetails/AddUserButton';
import BaseProfileCard from '@components/SharedComponents/BaseProfileCard';
import type { Influence } from '@libs/types/rust';
import { useCurrentUser } from '@services/user';
import { useGlobalTooltip } from '@states/globalTooltip';

import styles from './style.module.scss';

// TODO: Add featured map controls

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
  const tooltipProps = useGlobalTooltip((state) => state.tooltipProps);

  const { data: user } = useCurrentUser();

  const influenceData: Influence = {
    description: 'Edit here to give details.',
    // biome-ignore lint/style/noNonNullAssertion: user will always exist if this screen is reached
    user: user!,
    influence_type: 1,
    beatmaps: [],
  };

  return (
    <div className={styles.tutorialWrapper}>
      <h1>Getting Started</h1>
      <div className={styles.stepsWrapper}>
        <TutorialStep
          number={1}
          title={'Look up someone who inspired your mapping'}
        >
          <div className={styles.searchWrapper}>
            <SearchBar />
          </div>
        </TutorialStep>
        <TutorialStep
          number={2}
          title={'Add the user to  your influences list'}
        >
          <AddUserButton
            userId={0}
            action="add"
            dontShowForm
            {...tooltipProps(
              'You need to click this inside a profile. Search someone first!',
            )}
          />
        </TutorialStep>

        <TutorialStep
          number={3}
          title={'In your profile, describe how the mapper influenced you'}
        >
          <div className={styles.profileSide}>
            <InfluenceType editable influenceData={influenceData} />
            <BaseProfileCard userData={user} className={styles.card} />
          </div>
          <div className={styles.descriptionSide}>
            <EditableDescription
              label="Description textarea in tutorial"
              description=""
              placeholder="Edit here to give more details."
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
