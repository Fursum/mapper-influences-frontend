import { type FC, forwardRef, useCallback, useState } from 'react';
import { toast } from 'react-toastify';

import BaseProfileCard from '@components/SharedComponents/BaseProfileCard';
import MapCarousel from '@components/SharedComponents/MapCarousel/SingleItem';
import { AddMapModalContents } from '@components/SharedComponents/MapSearch';
import Modal from '@components/SharedComponents/Modal';
import { convertFromInfluence } from '@libs/enums';
import {
  type InfluenceResponse,
  useAddInfluenceMutation,
} from '@services/influence';
import { useGlobalTooltip } from '@states/globalTooltip';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

import EditableDescription from '../EditableDescription';
import InfluenceType from './InfluenceType';

import featuredMapsStyles from '../MapperDetails/FeaturedMaps/style.module.scss';
import styles from './style.module.scss';

type Props = {
  influenceData: InfluenceResponse;
  editable?: boolean;
};

const InfluenceElement = forwardRef<HTMLDivElement, Props>(
  ({ influenceData, editable }, ref) => {
    const { mutateAsync: updateInfluence, isPending } =
      useAddInfluenceMutation();

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
              loading={isPending}
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
            editable={editable && !isPending}
            placeholder={'Describe your influence here.'}
            onChange={(e) =>
              updateInfluenceDebounce({
                ...influenceData,
                description: e,
              })
            }
            statusText={{
              loading: 'Submitting influence description.',
              error: 'Could not update influence description.',
              success: 'Influence description updated.',
            }}
          />
          {(editable || influenceData.beatmaps) && (
            <div className={styles.maps}>
              <h4>
                Featured Maps{' '}
                <AddButton influenceData={influenceData} editable={editable} />
              </h4>
              <MapCarousel
                mapList={influenceData.beatmaps || []}
                editable={editable}
              />
            </div>
          )}
        </div>
      </>
    );
  },
);

InfluenceElement.displayName = 'InfluenceElement';

export default InfluenceElement;

const AddButton: FC<{
  influenceData: InfluenceResponse;
  editable?: boolean;
}> = ({ influenceData, editable }) => {
  const { activateTooltip, deactivateTooltip } = useGlobalTooltip();
  const [modalOpen, setModalOpen] = useState(false);

  const { mutateAsync: updateInfluence, isPending } = useAddInfluenceMutation();
  const onSubmit = useCallback(
    (values: { diff: string; set: string }) => {
      updateInfluence({
        ...influenceData,
        beatmaps: [
          ...(influenceData.beatmaps || []),
          {
            id: Number(values.diff || values.set),
            is_beatmapset: !!values.set,
          },
        ],
      }).then(() => setModalOpen(false));
    },
    [updateInfluence, influenceData],
  );

  if (!editable) return <></>;
  return (
    <>
      <Modal
        showModal={modalOpen}
        setShowModal={setModalOpen}
        className={featuredMapsStyles.modal}
        keepOpen
      >
        <AddMapModalContents
          closeForm={() => setModalOpen(false)}
          onSubmit={onSubmit}
          loading={isPending}
          suggestionUserId={influenceData.influenced_to}
        />
      </Modal>
      <button
        className={styles.addButton}
        aria-label={'Add maps to this influence'}
        onClick={() => setModalOpen(true)}
        onMouseEnter={() =>
          // biome-ignore lint/suspicious/noExplicitAny: <hack to display the tooltip on buttons>
          activateTooltip('Add maps to this influence', {} as any)
        }
        onMouseLeave={deactivateTooltip}
      >
        +
      </button>
    </>
  );
};
