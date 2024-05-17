import type { FC, } from 'react';

import MapCard from '@components/SharedComponents/MapCard';
import useEmblaCarousel from 'embla-carousel-react';

import styles from './style.module.scss';

const SliderCarousel: FC<{ mapList: any[] }> = ({ mapList }) => {
  const [emblaRef, _embla] = useEmblaCarousel({
    skipSnaps: true,
    inViewThreshold: 1,
    align: 'start',
  });

  return (
    <div ref={emblaRef} className={styles.viewport}>
      <div>
        {mapList.map((item) => (
          <div key={item.beatmapset.id} className={styles.slide}>
            <MapCard map={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SliderCarousel;
