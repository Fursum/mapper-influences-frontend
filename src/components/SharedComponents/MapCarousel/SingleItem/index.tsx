import type { FC, } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

import MapCard from '../../MapCard';

import styles from './style.module.scss';

const SingleItemCarousel: FC<{
  mapList: any[];
  className?: string;
  editable?: boolean;
}> = ({ mapList, editable, className = '' }) => {
  return (
    <Carousel
      className={`${styles.carousel} ${className}`}
      showStatus={false}
      showArrows={false}
      transitionTime={0}
      showThumbs={false}
    >
      {mapList.map((item) => (
        <div key={item.beatmapset.id} className={styles.slide}>
          <MapCard map={item} />
        </div>
      ))}
    </Carousel>
  );
};

export default SingleItemCarousel;
