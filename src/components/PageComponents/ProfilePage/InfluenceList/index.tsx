import { type CSSProperties, type FC, useCallback, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { toast } from 'react-toastify';

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
import type { Influence } from '@libs/types/rust';
import { useGetInfluences } from '@services/influence/getInfluences';
import { setInfluenceOrder } from '@services/influence/setInfluenceOrder';
import { useCurrentUser } from '@services/user';
import { useQueryClient } from '@tanstack/react-query';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import cx from 'classnames';

import InfluenceElement from './InfluenceElement';

import styles from './style.module.scss';

const debounceChangeOrder = AwesomeDebouncePromise(setInfluenceOrder, 2000);

const InfluenceList: FC<{
  userId?: string | number;
  open?: boolean;
}> = ({ userId, open }) => {
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;
  const editable =
    !!(userId?.toString() === currentUserId?.toString() && currentUserId) ||
    !userId;

  const queryClient = useQueryClient();
  const { data: influences } = useGetInfluences(userId);

  const [visibleCount, setVisibleCount] = useState<number>(5);

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
    (influenced_to: number, direction: 'up' | 'down') => {
      const newData = queryClient.setQueryData<Influence[]>(
        ['influences', currentUserId?.toString()],
        (data) => {
          if (!data) return data;

          const newInfluences = arrayMove(
            data,
            data.findIndex((item) => item.user.id === influenced_to),
            direction === 'up'
              ? data.findIndex((item) => item.user.id === influenced_to) - 1
              : data.findIndex((item) => item.user.id === influenced_to) + 1,
          ).filter((element) => Boolean(element));

          return newInfluences;
        },
      );

      if (!newData) return;

      // Send the order to server
      const influenceOrder = newData.map((inf) => inf.user.id);

      debounceChangeOrder(influenceOrder)
        .then(() => {
          toast.success('Updated influence order.');
        })
        .catch(() => {
          toast.error('Could not update influence order.');
        });
    },
    [queryClient, currentUserId],
  );

  const onDragEnd = useCallback(
    (evt: DragEndEvent) => {
      const { active, over } = evt;

      if (active.id === over?.id) return;

      const oldData = queryClient.getQueryData<Influence[]>([
        'influences',
        currentUserId?.toString(),
      ]);
      const newData = queryClient.setQueryData<Influence[]>(
        ['influences', currentUserId?.toString()],
        (data) => {
          if (!data || !over) return data;

          const oldIndex = data.findIndex((item) => item.user.id === active.id);
          const newIndex = data.findIndex((item) => item.user.id === over?.id);

          const newData = arrayMove(data, oldIndex, newIndex).filter(
            (element) => Boolean(element),
          );

          return newData;
        },
      );

      if (!newData) return;

      // Send the order to server
      const influenceOrder = newData.map((inf) => inf.user.id);

      setInfluenceOrder(influenceOrder)
        .then(() => toast.success('Updated influence order.'))
        .catch(() => {
          queryClient.setQueryData(
            ['influences', currentUserId?.toString()],
            oldData,
          );
          toast.error('Could not update influence order.');
        });
    },
    [queryClient, currentUserId],
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
          influences ? setVisibleCount((prev) => prev + 5) : [];
        }}
        hasMore={influences && influences.length > visibleCount}
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
            items={influences || []}
            strategy={verticalListSortingStrategy}
          >
            <div ref={setNodeRef}>
              {influences
                ?.slice(0, visibleCount)
                .map((influence) => (
                  <DraggableWrapper
                    key={influence.user.id}
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
  influence: Influence;
  editable?: boolean;
  changeOrder: (influenced_to: number, direction: 'up' | 'down') => void;
}> = ({ influence, editable, changeOrder }) => {
  if (editable)
    return <Draggable influence={influence} changeOrder={changeOrder} />;
  return (
    <InfluenceElement
      influenceData={influence}
      className={styles.draggableRow}
    />
  );
};

const Draggable: FC<{
  influence: Influence;
  changeOrder: (influenced_to: number, direction: 'up' | 'down') => void;
}> = ({ influence, changeOrder }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: influence.user.id,
    animateLayoutChanges: () => false,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cx({
        [styles.draggableRow]: true,
        [styles.dragging]: isDragging,
      })}
    >
      <div className={styles.sortColumn}>
        <button onClick={() => changeOrder(influence.user.id, 'up')}>
          <FontAwesomeIcon icon={faChevronUp} />
        </button>
        <FontAwesomeIcon
          icon={faBars}
          {...listeners}
          {...attributes}
          className={styles.handle}
        />
        <button onClick={() => changeOrder(influence.user.id, 'down')}>
          <FontAwesomeIcon icon={faChevronDown} />
        </button>
      </div>
      <InfluenceElement influenceData={influence} editable />
    </div>
  );
};
