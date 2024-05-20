import { type FC, useMemo } from 'react';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useGetInfluences } from '@services/influence';

import InfluenceElement from './InfluenceElement';

import styles from './style.module.scss';

const InfluenceList: FC<{
  userId?: string | number;
  open?: boolean;
}> = ({ userId, open }) => {
  const editable = !userId;

  const { data: influences } = useGetInfluences(userId);

  const [animateRef] = useAutoAnimate({ easing: 'ease-out', duration: 200 });

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

  return (
    <div
      className={styles.mapperInfluences}
      style={!open ? { display: 'none' } : {}}
    >
      <div className={styles.scrollWrapper} ref={animateRef}>
        {sortedInfluences?.map((influence) => (
          <InfluenceElement
            key={influence.influenced_to}
            influenceData={influence}
            editable={editable}
          />
        ))}
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
