import type { FC } from 'react';

import { useDescriptionMutation, useUserBio } from '@services/user';

import EditableDescription from '../EditableDescription';
import FeaturedMaps from './FeaturedMaps';
import MapStats from './MapStats';
import ProfileInfo from './ProfileInfo';

import styles from './style.module.scss';

type Props = {
  userId?: number | string;
};

const MapperDetails: FC<Props> = ({ userId }) => {
  const { data: osuData, isLoading } = useUserBio(userId?.toString());
  const editable = !userId;

  const { data: profileData } = useUserBio(userId?.toString());
  const { mutateAsync: updateDescription } = useDescriptionMutation();

  return (
    <div className={styles.mapperDetails}>
      <div className={styles.info}>
        <ProfileInfo userId={userId} />
        <MapStats userId={userId} />
      </div>
      <div
        className={`${styles.bio} ${isLoading ? styles.loading : ''}`}
        aria-busy={isLoading}
      >
        <span aria-live="polite" className="sr-only">
          {isLoading ? 'Loading profile details' : 'Profile details loaded'}
        </span>
        <div className={styles.desc}>
          <EditableDescription
            key={userId}
            label={`Description textarea for ${osuData?.username}`}
            description={profileData?.bio || ''}
            placeholder={'Enter a description for your profile.'}
            editable={editable}
            onChange={updateDescription}
            statusText={{
              loading: 'Submitting your bio.',
              error: 'Could not submit your bio.',
              success: 'Updated your bio.',
            }}
          />
        </div>
        <FeaturedMaps userId={userId} />
      </div>
    </div>
  );
};

export default MapperDetails;
