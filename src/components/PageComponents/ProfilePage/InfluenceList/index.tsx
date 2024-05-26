import { type FC, useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import {
  DndContext,
  type DragEndEvent,
  MouseSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  faBars,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type InfluenceResponse, useGetInfluences } from '@services/influence';

import InfluenceElement from './InfluenceElement';

import styles from './style.module.scss';

const InfluenceList: FC<{
  userId?: string | number;
  open?: boolean;
}> = ({ userId, open }) => {
  const editable = !userId;

  const { data: influences } = useGetInfluences(userId);

  const [visibleInfluences, setVisibleInfluences] = useState<
    InfluenceResponse[]
  >([]);

  useEffect(() => {
    setVisibleInfluences(influences?.slice(0, 5) || []);
  }, [influences]);

  const { setNodeRef } = useDroppable({
    id: 'influences',
  });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  const changeOrder = useCallback(
    (currentId: string, direction: 'up' | 'down') => {
      const currentIndex = visibleInfluences.findIndex(
        (influence) => influence.id === currentId,
      );
      if (currentIndex === -1) return;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= visibleInfluences.length) return;

      const newInfluences = [...visibleInfluences];
      newInfluences.splice(currentIndex, 1);
      newInfluences.splice(newIndex, 0, visibleInfluences[currentIndex]);

      setVisibleInfluences(newInfluences);
    },
    [visibleInfluences],
  );

  const onDragEnd = useCallback(
    (evt: DragEndEvent) => {
      const { active, over } = evt;

      if (over && active.id !== over?.id) {
        const oldIndex = visibleInfluences.findIndex(
          (item) => item.id === active.id,
        );
        const newIndex = visibleInfluences.findIndex(
          (item) => item.id === over.id,
        );
        const newData = arrayMove(visibleInfluences, oldIndex, newIndex).filter(
          (element) => Boolean(element),
        );

        setVisibleInfluences(newData);
      }
    },
    [visibleInfluences],
  );

  return (
    <div
      className={styles.mapperInfluences}
      style={!open ? { display: 'none' } : {}}
    >
      {!influences?.length && (
        <span>
          {'This person is unique!'}
          <br />
          {`...Or they haven't added anyone yet.`}
        </span>
      )}

      <InfiniteScroll
        initialLoad={true}
        loadMore={() => {
          influences
            ? setVisibleInfluences(
                influences?.slice(0, (visibleInfluences?.length || 0) + 5),
              )
            : [];
        }}
        hasMore={influences && influences.length > visibleInfluences.length}
        useWindow={true}
      >
        <DndContext
          id="influences"
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={visibleInfluences}
            strategy={verticalListSortingStrategy}
          >
            <div ref={setNodeRef}>
              {visibleInfluences?.map((influence) => (
                <DraggableWrapper
                  key={influence.influenced_to}
                  influence={influence}
                  editable={editable}
                  changeOrder={changeOrder}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </InfiniteScroll>
    </div>
  );
};

export default InfluenceList;

const DraggableWrapper: FC<{
  influence: InfluenceResponse;
  editable?: boolean;
  changeOrder: (currentId: string, direction: 'up' | 'down') => void;
}> = ({ influence, editable, changeOrder }) => {
  if (editable)
    return <Draggable influence={influence} changeOrder={changeOrder} />;
  return <InfluenceElement influenceData={influence} />;
};

const Draggable: FC<{
  influence: InfluenceResponse;
  changeOrder: (currentId: string, direction: 'up' | 'down') => void;
}> = ({ influence, changeOrder }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: influence.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.draggableRow}>
      <div className={styles.sortColumn}>
        <button onClick={() => changeOrder(influence.id, 'up')}>
          <FontAwesomeIcon icon={faChevronUp} />
        </button>
        <FontAwesomeIcon
          icon={faBars}
          {...listeners}
          {...attributes}
          className={styles.handle}
        />
        <button onClick={() => changeOrder(influence.id, 'down')}>
          <FontAwesomeIcon icon={faChevronDown} />
        </button>
      </div>
      <InfluenceElement influenceData={influence} editable />
    </div>
  );
};
