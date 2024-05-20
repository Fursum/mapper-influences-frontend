import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import { type InfluenceResponse, useGetInfluences } from '@services/influence';

import InfluenceElement from './InfluenceElement';

import styles from './style.module.scss';

const InfluenceList: FC<{
  userId?: string | number;
  open?: boolean;
}> = ({ userId, open }) => {
  const editable = !userId;

  const { data: influences } = useGetInfluences(userId);

  //const [animateRef] = useAutoAnimate({ easing: 'ease-out', duration: 200 });

  const scrollRef = useRef<HTMLDivElement>(null);

  const [visibleInfluences, setVisibleInfluences] = useState<
    InfluenceResponse[]
  >([]);

  const sortedInfluences = useMemo(() => {
    // Sort by influence level first, then by date
    return influences?.sort((a, b) => {
      if (a.type === b.type)
        return (
          new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime()
        );

      return b.type - a.type;
    });
  }, [influences]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <intended for initial load>
  useEffect(() => {
    setVisibleInfluences(sortedInfluences?.slice(0, 5) || []);
  }, [influences]);

  return (
    <div
      className={styles.mapperInfluences}
      style={!open ? { display: 'none' } : {}}
    >
      <div className={styles.scrollWrapper} ref={scrollRef}>
        <InfiniteScroll
          initialLoad={true}
          loadMore={() => {
            influences
              ? setVisibleInfluences(
                  influences?.slice(0, (sortedInfluences?.length || 0) + 5),
                )
              : [];
          }}
          hasMore={influences && influences.length > visibleInfluences.length}
          useWindow={false}
          getScrollParent={() => scrollRef.current}
          loader={<div>...</div>}
        >
          {visibleInfluences?.map((influence) => (
            <InfluenceElement
              key={influence.influenced_to}
              influenceData={influence}
              editable={editable}
            />
          ))}
        </InfiniteScroll>

        {!influences?.length && (
          <span>
            {'This person is unique!'}
            <br />
            {`...Or they haven't added anyone yet.`}
          </span>
        )}
      </div>
    </div>
  );
};

export default InfluenceList;
