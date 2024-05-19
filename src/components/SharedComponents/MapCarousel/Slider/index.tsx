import type { FC } from 'react';

import MapCard from '@components/SharedComponents/MapCard';
import type { BeatmapId } from '@services/influence';
import { useDeleteMapFromSelfMutation } from '@services/maps';
import useEmblaCarousel from 'embla-carousel-react';
import { useRouter } from 'next/router';

import styles from './style.module.scss';

const LIMIT = 5;

const SliderCarousel: FC<{ mapList: BeatmapId[] }> = ({ mapList }) => {
  const router = useRouter();
  const [emblaRef, _embla] = useEmblaCarousel({
    dragFree: true,
    align: 'start',
  });

  const isEditable = router.asPath === '/profile';

  const { mutateAsync: deleteMap, isPending } = useDeleteMapFromSelfMutation();

  return (
    <section className={styles.embla}>
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
          {mapList.length < LIMIT && isEditable && (
            <div className={`${styles.slot} ${styles.slide}`}>
              <span>
                Map slots {mapList.length} / {LIMIT}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SliderCarousel;
