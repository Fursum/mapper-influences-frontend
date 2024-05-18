import type { FC } from 'react';

import MapCard from '@components/SharedComponents/MapCard';
import type { BeatmapId } from '@services/influence';
import { useDeleteMapFromSelfMutation } from '@services/maps';
import useEmblaCarousel from 'embla-carousel-react';
import { useRouter } from 'next/router';

import styles from './style.module.scss';

const SliderCarousel: FC<{ mapList: BeatmapId[] }> = ({ mapList }) => {
  const router = useRouter();
  const [emblaRef, _embla] = useEmblaCarousel({
    skipSnaps: true,
    inViewThreshold: 1,
    align: 'start',
  });

  const isEditable = router.asPath === '/profile';

  const { mutateAsync: deleteMap, isPending } = useDeleteMapFromSelfMutation();

  return (
    <div ref={emblaRef} className={styles.viewport}>
      <div>
        {mapList.map((item) => (
          <div key={item.id} className={styles.slide}>
            <MapCard
              map={item}
              deleteFn={isEditable ? deleteMap : undefined}
              loading={isPending}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SliderCarousel;
