import { type FC, useCallback, useState } from 'react';
import { toast } from 'react-toastify';

import BaseProfileCard from '@components/SharedComponents/BaseProfileCard';
import MapCarousel from '@components/SharedComponents/MapCarousel/SingleItem';
import { AddMapModalContents } from '@components/SharedComponents/MapSearch';
import Modal from '@components/SharedComponents/Modal';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { convertFromInfluence } from '@libs/enums';
import {
  type BeatmapId,
  type InfluenceResponse,
  useAddInfluenceMutation,
} from '@services/influence';
import { useGlobalTooltip } from '@states/globalTooltip';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import cx from 'classnames';

import EditableDescription from '../EditableDescription';
import InfluenceType from './InfluenceType';

import featuredMapsStyles from '../MapperDetails/FeaturedMaps/style.module.scss';
import styles from './style.module.scss';

const LIMIT = 5;

type Props = {
  influenceData: InfluenceResponse;
  editable?: boolean;
  className?: string;
};

const InfluenceElement: FC<Props> = ({
  influenceData,
  editable,
  className = '',
}) => {
  const { mutateAsync: updateInfluence, isPending } = useAddInfluenceMutation();
  const [updateState, setUpdateState] = useState<
    'untouched' | 'dirty' | 'success' | 'error'
  >('untouched');

  // Debounce the description update
  const updateInfluenceDebounce = AwesomeDebouncePromise(updateInfluence, 3000);

  const onDelete = editable
    ? (map: BeatmapId) => {
        updateInfluence({
          ...influenceData,
          beatmaps: influenceData.beatmaps?.filter((b) => b.id !== map.id),
        })
          .then(() => toast.success('Map removed from influence.'))
          .catch(() => toast.error('Could not remove map from influence.'));
      }
    : undefined;

  return (
    <>
      <div
        className={cx({
          [styles.influenceRow]: true,
          [className]: true,
          'border-0 border-r-4 border-solid': true,
          'border-transparent': updateState === 'untouched',
          'border-dashed border-secondary':
            updateState === 'dirty' && !isPending,
          'border-orange-400': isPending,
          'border-red-400': updateState === 'error',
          'border-green-400': updateState === 'success',
          [styles.successFade]: updateState === 'success',
        })}
      >
        <div className={styles.cardWrapper}>
          <InfluenceType
            editable={editable}
            loading={isPending}
            influenceData={influenceData}
            onChange={(type) => {
              setUpdateState('dirty');
              return updateInfluence({
                ...influenceData,
                type: convertFromInfluence(type),
              })
                .then(() => setUpdateState('success'))
                .catch(() => {
                  setUpdateState('error');
                  toast.error('Could not update influence type.');
                });
            }}
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
          noSubmitOnChange={(e) => {
            setUpdateState('dirty');
            return updateInfluenceDebounce({
              ...influenceData,
              description: e,
            })
              .then(() => setUpdateState('success'))
              .catch(() => {
                setUpdateState('error');
                toast.error('Could not update description.');
              });
          }}
        />
        <div className={styles.maps}>
          {editable || !!influenceData.beatmaps.length ? (
            <>
              <h4>
                Featured Maps{' '}
                {influenceData.beatmaps?.length < LIMIT && (
                  <AddButton
                    influenceData={influenceData}
                    editable={editable}
                    setUpdateState={setUpdateState}
                  />
                )}
              </h4>
              <MapCarousel
                mapList={influenceData.beatmaps || []}
                editable={editable}
                onDelete={onDelete}
              />
            </>
          ) : (
            <div className={styles.placeholder}>
              <span>{'No maps added :('}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

InfluenceElement.displayName = 'InfluenceElement';

export default InfluenceElement;

const AddButton: FC<{
  influenceData: InfluenceResponse;
  editable?: boolean;
  setUpdateState: (state: 'untouched' | 'dirty' | 'success' | 'error') => void;
}> = ({ influenceData, editable, setUpdateState }) => {
  const activateTooltip = useGlobalTooltip((state) => state.activateTooltip);
  const deactivateTooltip = useGlobalTooltip(
    (state) => state.deactivateTooltip,
  );
  const [modalOpen, setModalOpen] = useState(false);

  const { mutateAsync: updateInfluence, isPending } = useAddInfluenceMutation();
  const onSubmit = useCallback(
    (diffs: number[]) => {
      setUpdateState('dirty');
      updateInfluence({
        ...influenceData,
        beatmaps: [
          ...(influenceData.beatmaps || []),
          ...diffs.map((id) => ({ id, is_beatmapset: false })),
        ],
      })
        .then(() => {
          setUpdateState('success');
          setModalOpen(false);
        })
        .catch(() => {
          setUpdateState('error');
          toast.error('Could not add maps to influence.');
        });
    },
    [updateInfluence, influenceData, setUpdateState],
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
          mapLimit={LIMIT - (influenceData.beatmaps?.length || 0)}
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
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </>
  );
};
