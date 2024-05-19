import { type FC, useCallback, useState } from 'react';

import MapCarousel from '@components/SharedComponents/MapCarousel/Slider';
import { AddMapModalContents } from '@components/SharedComponents/MapSearch';
import Modal from '@components/SharedComponents/Modal';
import { useAddMapToSelfMutation } from '@services/maps';
import { useUserBio } from '@services/user';
import { useGlobalTooltip } from '@states/globalTooltip';

import styles from './style.module.scss';

const FeaturedMaps: FC<{ userId?: string | number }> = ({ userId }) => {
  const { data: profileData } = useUserBio(userId?.toString());

  const beatmapCount = profileData?.beatmaps?.length || 0;

  // Dont show anything if featured maps dont exist
  if (userId && beatmapCount) return <></>;

  return (
    <div className={styles.featuredMaps}>
      <h3>Featured Maps {beatmapCount < 5 && <AddButton userId={userId} />}</h3>
      <MapCarousel mapList={profileData?.beatmaps || []} />
    </div>
  );
};

export default FeaturedMaps;

const AddButton: FC<{ userId?: string | number }> = ({ userId }) => {
  const { activateTooltip, deactivateTooltip } = useGlobalTooltip();
  const [modalOpen, setModalOpen] = useState(false);

  const { mutateAsync: addMap, isPending } = useAddMapToSelfMutation();
  const onSubmit = useCallback(
    (values: { diff: string; set: string }) => {
      addMap({
        mapId: Number(values.diff || values.set),
        isSet: !!values.set,
      }).then(() => setModalOpen(false));
    },
    [addMap],
  );

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
        <AddMapModalContents
          closeForm={() => setModalOpen(false)}
          onSubmit={onSubmit}
          loading={isPending}
          suggestionUserId={userId}
        />
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
