import type { FC } from 'react';

import {
  useDescriptionMutation,
  useFullUser,
  useUserBio,
} from '@services/user';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

import EditableDescription from '../EditableDescription';
import FeaturedMaps from './FeaturedMaps';
import MapStats from './MapStats';
import ProfileInfo from './ProfileInfo';

import styles from './style.module.scss';

type Props = {
  userId?: number | string;
};

const MapperDetails: FC<Props> = ({ userId }) => {
  const { data: osuData, isLoading } = useFullUser(userId?.toString());
  const editable = !userId;

  const { data: profileData } = useUserBio(userId?.toString());
  const { mutateAsync: updateDescription } = useDescriptionMutation();

  const updateDescriptionDebounce = AwesomeDebouncePromise(
    updateDescription,
    500,
  );

  return (
    <div className={styles.mapperDetails}>
      <div className={styles.info}>
        <ProfileInfo userId={userId} />
        <MapStats userId={userId} />
      </div>
      <div className={`${styles.bio} ${isLoading ? styles.loading : ''}`}>
        <div className={styles.desc}>
          <EditableDescription
            label={`Description textarea for ${osuData?.username}`}
            description={profileData?.bio || ''}
            placeholder={'Enter a description for your profile.'}
            editable={editable}
            onChange={(e) => updateDescriptionDebounce(e.target.value)}
            statusText={{
              loading: 'Submitting your bio.',
              error: 'Could not submit your bio.',
              success: 'Updated your bio.',
            }}
          />
        </div>
        <FeaturedMaps />
      </div>
    </div>
  );
};

export default MapperDetails;
