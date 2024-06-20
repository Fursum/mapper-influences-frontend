import { type FC, useCallback, useState } from 'react';

import MapCarousel from '@components/SharedComponents/MapCarousel/Slider';
import { AddMapModalContents } from '@components/SharedComponents/MapSearch';
import Modal from '@components/SharedComponents/Modal';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAddMapToSelfMutation } from '@services/maps';
import { useUserBio } from '@services/user';
import { useGlobalTooltip } from '@states/globalTooltip';
import { useIsClient } from 'usehooks-ts';

import styles from './style.module.scss';

const FeaturedMaps: FC<{ userId?: string | number }> = ({ userId }) => {
  const { data: profileData } = useUserBio(userId?.toString());

  const beatmapCount = profileData?.beatmaps?.length || 0;

  const isClient = useIsClient();

  if (!isClient) return null;

  // Dont show anything if featured maps dont exist
  if (userId && !beatmapCount) return <></>;

  return (
    <div className={styles.featuredMaps}>
      <h3>Featured Maps {beatmapCount < 5 && <AddButton userId={userId} />}</h3>
      <MapCarousel mapList={profileData?.beatmaps || []} editable={!userId} />
    </div>
  );
};

export default FeaturedMaps;

const AddButton: FC<{ userId?: string | number }> = ({ userId }) => {
  const { data: userBio } = useUserBio(userId);

  const activateTooltip = useGlobalTooltip((state) => state.activateTooltip);
  const deactivateTooltip = useGlobalTooltip(
    (state) => state.deactivateTooltip,
  );

  const [modalOpen, setModalOpen] = useState(false);

  const { mutateAsync: addMap, isPending } = useAddMapToSelfMutation();
  const onSubmit = useCallback(
    (selectedDiffs: number[]) => {
      const remainingDiffs = [...selectedDiffs];

      // Doing recursively since we dont have batch add
      const addMapRecursive = (diffs: number[]) => {
        if (diffs.length === 0) {
          setModalOpen(false);
          return;
        }
        const diff = diffs.pop();
        if (!diff) {
          setModalOpen(false);
          return;
        }
        addMap({ mapId: diff, isSet: false }).then(() =>
          addMapRecursive(diffs),
        );
      };

      addMapRecursive(remainingDiffs);
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
          mapLimit={5 - (userBio?.beatmaps?.length || 0)}
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
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </>
  );
};
