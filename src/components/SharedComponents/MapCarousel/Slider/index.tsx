import type { FC } from 'react';

import MapCard from '@components/SharedComponents/MapCard';
import type { BeatmapSmall } from '@libs/types/rust';
import { useDeleteMapFromSelfMutation } from '@services/maps';
import useEmblaCarousel from 'embla-carousel-react';

import styles from './style.module.scss';

const LIMIT = 5;

const SliderCarousel: FC<{ mapList: BeatmapSmall[]; editable?: boolean }> = ({
  mapList,
  editable,
}) => {
  const [emblaRef, _embla] = useEmblaCarousel({
    dragFree: true,
    align: 'start',
  });

  const { mutateAsync: deleteMap, isPending } = useDeleteMapFromSelfMutation();

  return (
    <section className={styles.embla}>
      <div ref={emblaRef} className={styles.viewport}>
        <div>
          {mapList.map((item) => (
            <div key={item.id} className={styles.slide}>
              <MapCard
                map={item}
                deleteFn={editable ? deleteMap : undefined}
                loading={isPending}
              />
            </div>
          ))}
          {mapList.length < LIMIT && editable && (
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
