import { type FC, useMemo } from 'react';

import type { Activity } from '@libs/types/activity';
import { useActivities } from '@services/activity';
import { useCurrentUser } from '@services/user';
import { useGlobalTooltip } from '@states/globalTooltip';

import ConditionalLink from '../ConditionalLink';
import ProfilePhoto from '../ProfilePhoto';
import RelativeTime from './RelativeTime';

const ActivityList: FC = () => {
  const { activities } = useActivities();

  return (
    <div className="bg-background-content p-2">
      <h2 className="my-3 min-w-[25rem] text-center">Recent Activity</h2>
      <div
        className="flex h-[37rem] max-h-[37rem] flex-col gap-4 overflow-y-auto px-2"
        style={{ scrollbarGutter: 'stable' }} // Firefox scrollbar fix
      >
        {activities.map((activity) => (
          <ActivityRow key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
};

export default ActivityList;

const ActivityRow: FC<{
  activity: Activity;
}> = ({ activity }) => {
  const tooltipProps = useGlobalTooltip((state) => state.tooltipProps);

  const { isoDate, onMouseEnter, onMouseLeave } = useMemo(() => {
    const adjustedTime = new Date(activity.created_at).getTime();

    const { onMouseEnter, onMouseLeave } = tooltipProps(
      new Date(adjustedTime).toLocaleString(),
    );

    return {
      isoDate: new Date(adjustedTime).toISOString(),
      onMouseEnter,
      onMouseLeave,
    };
  }, [activity.created_at, tooltipProps]);

  return (
    <div className="w-[25rem]">
      <div className="flex w-full justify-between">
        <SmallUser user={activity.user} />

        <span
          className="ml-auto shrink-0 pl-2 text-sm text-text-faded"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <RelativeTime date={isoDate} />
        </span>
      </div>

      <div className="flex w-full">
        <DetailsRow activity={activity} />
      </div>
    </div>
  );
};

// Memoized because the RelativeTime component triggers a re-render on this for some reason???
const DetailsRow: FC<{ activity: Activity }> = ({ activity }) => {
  if (activity.event_type === 'ADD_INFLUENCE') {
    return (
      <>
        <span className="mr-1 shrink-0">influenced from</span>
        <SmallUser user={activity.influence} />
      </>
    );
  }

  if (activity.event_type === 'REMOVE_INFLUENCE') {
    return (
      <>
        <span className="mr-1 shrink-0">removed influence of</span>
        <SmallUser user={activity.influence} />
      </>
    );
  }

  if (
    activity.event_type === 'ADD_USER_BEATMAP' ||
    activity.event_type === 'REMOVE_USER_BEATMAP'
  )
    return <>edited their beatmaps</>;

  if (
    activity.event_type === 'ADD_INFLUENCE_BEATMAP' ||
    activity.event_type === 'REMOVE_INFLUENCE_BEATMAP'
  )
    return (
      <>
        <span className="mr-1 shrink-0">edited beatmaps of</span>
        <SmallUser user={activity.influence} />
      </>
    );

  if (activity.event_type === 'EDIT_INFLUENCE_TYPE')
    return (
      <>
        <span className="mr-1 shrink-0">changed influence type of</span>
        <SmallUser user={activity.influence} />
      </>
    );

  if (activity.event_type === 'EDIT_INFLUENCE_DESC')
    return (
      <>
        <span className="mr-1 shrink-0">edited influence description of</span>
        <SmallUser user={activity.influence} />
      </>
    );

  if (activity.event_type === 'LOGIN') return <>logged in</>;
  if (activity.event_type === 'EDIT_BIO') return <>edited their bio</>;
};

const SmallUser: FC<{
  user: {
    username: string;
    avatar_url: string;
    id: number;
  };
}> = ({ user }) => {
  const { data: currentUser } = useCurrentUser();

  return (
    <span className="truncate">
      <ProfilePhoto
        photoUrl={user.avatar_url}
        size="sm"
        circle
        className="-mb-[0.1rem] mr-1 inline-block"
      />
      <ConditionalLink
        disabled={!currentUser}
        href={`/profile/${user.id}`}
        className="inline-block text-text"
      >
        <span className="w-fit font-bold">{user.username}</span>
      </ConditionalLink>
    </span>
  );
};
