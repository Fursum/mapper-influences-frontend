import MapCard from "@components/SharedComponents/MapCard";
import { FeaturedMapsResponse } from "@services/user";
import useEmblaCarousel from "embla-carousel-react";
import { FC, useCallback, useEffect, useState } from "react";

import styles from "./style.module.scss";

const SliderCarousel: FC<{ mapList: FeaturedMapsResponse[] }> = ({
  mapList,
}) => {
  const [emblaRef, embla] = useEmblaCarousel({
    skipSnaps: true,
    inViewThreshold: 1,
    align: "start",
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
