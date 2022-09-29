import { FC, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

import { MapInfo } from "@libs/types/user";
import MapCard from "../MapCard";

import styles from "./style.module.scss";

const MapCarousel: FC<{ mapList: MapInfo[] }> = ({ mapList }) => {
  const [emblaRef, embla] = useEmblaCarousel({
    skipSnaps: true,
    inViewThreshold: 1,
    align: "start",
  });

  // States for showing scrollable gradient
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  const onScroll = useCallback(() => {
    if (!embla) return;
    setHasPrev(embla.scrollProgress() > 0);
    setHasNext(embla.scrollProgress() < 100);
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    embla.on("scroll", onScroll);
    onScroll();
  }, [embla, onScroll]);

  return (
    <div ref={emblaRef} className={styles.viewport}>
      <div>
        {mapList.map((item) => (
          <div key={item.mapUrl} className={styles.slide}>
            <MapCard {...item} />
          </div>
        ))}
      </div>
      <div
        className={`${styles.prevGradient} ${hasPrev ? styles.visible : ""}`}
      />
      <div
        className={`${styles.nextGradient} ${hasNext ? styles.visible : ""}`}
      />
    </div>
  );
};

export default MapCarousel;
