import type { FC } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

import type { BeatmapId } from '@services/influence';
import { useMapData } from '@services/maps';

import MapCard from '../../MapCard';

import styles from './style.module.scss';

const SingleItemCarousel: FC<{
  mapList: BeatmapId[];
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
        <div key={item.id} className={styles.slide}>
          <MapCardWrapper id={item.id} isSet={item.is_beatmapset} />
        </div>
      ))}
    </Carousel>
  );
};

export default SingleItemCarousel;

const MapCardWrapper: FC<{ id: number | string; isSet: boolean }> = ({
  id,
  isSet,
}) => {
  const { data: map } = useMapData(id, isSet ? 'set' : 'diff');

  return <MapCard map={map} />;
};
