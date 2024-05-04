import "react-responsive-carousel/lib/styles/carousel.min.css";

import { MapInfo } from "@libs/types/user";
import { FeaturedMapsResponse } from "@services/user";
import { FC, useCallback, useEffect, useState } from "react";
import { Carousel } from "react-responsive-carousel";

import MapCard from "../../MapCard";
import styles from "./style.module.scss";

const SingleItemCarousel: FC<{
  mapList: FeaturedMapsResponse[];
  className?: string;
  editable?: boolean;
}> = ({ mapList, editable, className = "" }) => {
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
