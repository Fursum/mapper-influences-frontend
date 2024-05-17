import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';

import MapCard from '@components/SharedComponents/MapCard';
import MapCarousel from '@components/SharedComponents/MapCarousel/Slider';
import Modal from '@components/SharedComponents/Modal';
import { isNumber } from '@libs/functions';
import { useMapData } from '@services/maps';
import { useUserBio } from '@services/user';
import { useGlobalTooltip } from '@states/globalTooltip';

import styles from './style.module.scss';

const FeaturedMaps: FC<{ userId?: string | number }> = ({ userId }) => {
  const { data: profileData } = useUserBio(userId?.toString());

  // Dont show anything if features maps dont exist
  if (userId && /* !profileData?.featured_maps?.length */ true) return <></>;

  return (
    <div className={styles.featuredMaps}>
      <h3>
        Featured Maps <AddButton />
      </h3>
      <MapCarousel mapList={[]} />
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
        onMouseEnter={(e) =>
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

  const { data: mapData, error } = useMapData(...getValidMapInfo());

  return (
    <>
      <h2>Add a map</h2>

      <form
        onSubmit={handleSubmit((values) => {
          console.log(values);
        })}
      >
        <label>
          Difficulty:
          <input
            {...register('diff', { pattern: /\d+/ })}
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
            {...register('set', { pattern: /\d+/ })}
            className={`${formState.errors.set ? 'error' : ''}`}
            placeholder="enter ID"
            autoComplete="off"
            onBlur={() => trigger('set')}
          />
        </label>
      </form>

      <h4>Map preview</h4>
      <div className={styles.preview}>
        {mapData && <MapCard map={mapData} diffId={diffId} />}
        {error && <div className={styles.error}>{error.message}</div>}
      </div>

      <div className={styles.buttons}>
        <button className={'cancel'} type="button" onClick={closeForm}>
          Close
        </button>
        <button disabled={!mapData} type="submit">
          Add
        </button>
      </div>
    </>
  );
};
