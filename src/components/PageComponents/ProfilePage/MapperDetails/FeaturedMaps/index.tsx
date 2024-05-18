import { type FC, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import MapCard from '@components/SharedComponents/MapCard';
import MapCarousel from '@components/SharedComponents/MapCarousel/Slider';
import Modal from '@components/SharedComponents/Modal';
import { isNumber } from '@libs/functions';
import { useAddMapToSelfMutation, useMapData } from '@services/maps';
import { useUserBio } from '@services/user';
import { useGlobalTooltip } from '@states/globalTooltip';

import styles from './style.module.scss';

const FeaturedMaps: FC<{ userId?: string | number }> = ({ userId }) => {
  const { data: profileData } = useUserBio(userId?.toString());

  // Dont show anything if featured maps dont exist
  if (userId && profileData?.beatmaps?.length) return <></>;

  return (
    <div className={styles.featuredMaps}>
      <h3>
        Featured Maps <AddButton userId={userId} />
      </h3>
      <MapCarousel mapList={profileData?.beatmaps || []} />
    </div>
  );
};

export default FeaturedMaps;

const AddButton: FC<{ userId?: string | number }> = ({ userId }) => {
  const { activateTooltip, deactivateTooltip } = useGlobalTooltip();
  const [modalOpen, setModalOpen] = useState(false);

  // No userid means the user is viewing their own profile
  if (userId) return <></>;
  return (
    <>
      <Modal
        showModal={modalOpen}
        setShowModal={setModalOpen}
        className={styles.modal}
        keepOpen
      >
        <AddMapModalContents closeForm={() => setModalOpen(false)} />
      </Modal>
      <button
        aria-label="Add maps to your profile"
        onClick={() => setModalOpen(true)}
        onMouseEnter={() =>
          // biome-ignore lint/suspicious/noExplicitAny: <hack to display the tooltip on buttons>
          activateTooltip('Add maps to your profile', {} as any)
        }
        onMouseLeave={deactivateTooltip}
      >
        +
      </button>
    </>
  );
};

const AddMapModalContents: FC<{ closeForm: () => void }> = ({ closeForm }) => {
  const { mutateAsync: addMap, isPending } = useAddMapToSelfMutation();

  const { register, watch, formState, handleSubmit, trigger } = useForm<{
    diff: string;
    set: string;
  }>();

  const diffId = watch('diff');
  const setId = watch('set');

  const getValidMapInfo = () => {
    if (diffId && isNumber(diffId)) return [diffId, 'diff'];

    if (setId && isNumber(setId)) return [setId, 'set'];

    return [];
  };

  const mapInfo = getValidMapInfo();

  const { data: mapData, error } = useMapData(...mapInfo);

  const onSubmit = useCallback(
    (values: { diff: string; set: string }) => {
      addMap({
        mapId: Number(values.diff || values.set),
        isSet: !!values.set,
      }).then(closeForm);
    },
    [addMap, closeForm],
  );

  return (
    <>
      <h2>Add a map</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>
          Difficulty:
          <input
            {...register('diff', { pattern: /^\d*$/ })}
            className={`${formState.errors.diff ? 'error' : ''}`}
            placeholder="enter ID"
            autoComplete="off"
            onBlur={() => trigger('diff')}
          />
        </label>
        <div>or...</div>
        <label>
          Set:
          <input
            {...register('set', { pattern: /^\d*$/ })}
            className={`${formState.errors.set ? 'error' : ''}`}
            placeholder="enter ID"
            autoComplete="off"
            onBlur={() => trigger('set')}
          />
        </label>

        <h4>Map preview</h4>
        <div className={styles.preview}>
          {mapData && (
            <MapCard
              map={{
                id: Number(mapInfo[0]),
                is_beatmapset: mapInfo[1] === 'set',
              }}
              diffId={diffId}
            />
          )}
          {error && <div className={styles.error}>{error.message}</div>}
        </div>

        <div className={styles.buttons}>
          <button className={'cancel'} type="button" onClick={closeForm}>
            Close
          </button>
          <button disabled={!mapData || !formState.isValid} type="submit">
            {isPending ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>
    </>
  );
};
