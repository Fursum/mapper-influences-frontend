import { forwardRef } from 'react';
import { toast } from 'react-toastify';

import BaseProfileCard from '@components/SharedComponents/BaseProfileCard';
import MapCarousel from '@components/SharedComponents/MapCarousel/SingleItem';
import { convertFromInfluence } from '@libs/enums';
import {
  type InfluenceResponse,
  useAddInfluenceMutation,
} from '@services/influence';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

import EditableDescription from '../EditableDescription';
import InfluenceType from './InfluenceType';

import styles from './style.module.scss';

type Props = {
  influenceData: InfluenceResponse;
  editable?: boolean;
};

const InfluenceElement = forwardRef<HTMLDivElement, Props>(
  ({ influenceData, editable }, ref) => {
    const { mutateAsync: updateInfluence } = useAddInfluenceMutation();

    // Debounce the description update
    const updateInfluenceDebounce = AwesomeDebouncePromise(
      updateInfluence,
      500,
    );

    return (
      <>
        <div className={styles.influenceRow} ref={ref}>
          <div className={styles.cardWrapper}>
            <InfluenceType
              editable={editable}
              influenceData={influenceData}
              onChange={(type) =>
                updateInfluence({
                  ...influenceData,
                  type: convertFromInfluence(type),
                }).then(() => toast.success('Updated influence type.'))
              }
            />
            <BaseProfileCard
              userId={influenceData.influenced_to}
              className={`${editable ? styles.editable : ''}`}
            />
          </div>
          <EditableDescription
            className={styles.description}
            label={'Description textarea'}
            description={influenceData.description || ''}
            editable={editable}
            placeholder={'Describe your influence here.'}
            onChange={(e) =>
              updateInfluenceDebounce({
                ...influenceData,
                description: e.currentTarget.value,
              }).then(() => {
                toast.success('Updated influence description.');
              })
            }
            statusText={{
              loading: 'Submitting influence description.',
              error: 'Could not update influence description.',
              success: 'Updated influence description.',
            }}
          />
          {false && (
            <div className={styles.maps}>
              <h4>Featured Maps</h4>
              <MapCarousel mapList={influenceData.beatmaps} />
            </div>
          )}
        </div>
      </>
    );
  },
);

InfluenceElement.displayName = 'InfluenceElement';

export default InfluenceElement;
