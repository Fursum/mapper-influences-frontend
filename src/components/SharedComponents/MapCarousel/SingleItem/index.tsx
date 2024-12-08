import type { FC } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

import type { BeatmapSmall } from '@libs/types/rust';

import MapCard from '../../MapCard';

import emblaStyles from '../Slider/style.module.scss';
import styles from './style.module.scss';

const LIMIT = 5;

const SingleItemCarousel: FC<{
  mapList: BeatmapSmall[];
  className?: string;
  editable?: boolean;
  onDelete?: (map: string | number) => void;
}> = ({ mapList, editable, onDelete, className = '' }) => {
  const Cards = mapList.map((item) => (
    <div key={item.id} className={styles.slide}>
      <MapCard map={item} deleteFn={onDelete} />
    </div>
  ));

  if (mapList.length < LIMIT && editable)
    Cards.push(
      <div key={'slot'} className={`${emblaStyles.slot}`}>
        <span>
          Map slots {mapList.length} / {LIMIT}
        </span>
      </div>,
    );

  return (
    <Carousel
      className={`${styles.carousel} ${className}`}
      showStatus={false}
      showArrows={true}
      showThumbs={false}
      showIndicators={mapList.length + (editable ? 1 : 0) > 1}
      transitionTime={0}
    >
      {Cards}
    </Carousel>
  );
};

export default SingleItemCarousel;
