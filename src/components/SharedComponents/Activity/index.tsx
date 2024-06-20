import type { FC } from 'react';

import { type Activity, useActivities } from '@services/activity';
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
          <ActivityRow
            key={`${activity.datetime}-${activity.user.username}`}
            activity={activity}
          />
        ))}
      </div>
    </div>
  );
};

export default ActivityList;

const ActivityRow: FC<{
  activity: Activity;
}> = ({ activity }) => {
  const activateTooltip = useGlobalTooltip((state) => state.activateTooltip);

  // Adjust the activity timestamp to the local offset
  const timezoneOffset = new Date().getTimezoneOffset() * 60000;
  const adjustedTime = new Date(activity.datetime).getTime() - timezoneOffset;

  return (
    <div className="w-[25rem]">
      <div className="flex w-full justify-between">
        <SmallUser user={activity.user} />

        <span
          className="ml-auto shrink-0 pl-2 text-sm text-text-faded"
          onMouseEnter={(e) =>
            activateTooltip(
              new Date(adjustedTime).toLocaleString(),
              e.currentTarget,
            )
          }
        >
          <RelativeTime date={new Date(adjustedTime).toISOString()} />
        </span>
      </div>

      <div className="flex w-full">
        <DetailsRow activity={activity} />
      </div>
    </div>
  );
};

const DetailsRow: FC<{ activity: Activity }> = ({ activity }) => {
  if (activity.type === 'ADD_INFLUENCE' && activity.details.influenced_to) {
    return (
      <>
        <span className="mr-1 shrink-0">influenced from</span>
        <SmallUser user={activity.details.influenced_to} />
      </>
    );
  }

  if (activity.type === 'REMOVE_INFLUENCE' && activity.details.influenced_to) {
    return (
      <>
        <span className="mr-1 shrink-0">removed influence of</span>
        <SmallUser user={activity.details.influenced_to} />
      </>
    );
  }

  if (activity.type === 'ADD_BEATMAP' || activity.type === 'REMOVE_BEATMAP')
    return <>edited their beatmaps</>;
  if (activity.type === 'LOGIN') return <>logged in</>;
  if (activity.type === 'EDIT_BIO') return <>edited their bio</>;
};

const SmallUser: FC<{
  user: {
    username: string;
    avatar_url: string;
    id: number;
  };
}> = ({ user }) => {
  const { data: currentUser } = useCurrentUser();
  const activateTooltip = useGlobalTooltip((state) => state.activateTooltip);
  const deactivateTooltip = useGlobalTooltip(
    (state) => state.deactivateTooltip,
  );

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
        onClick={
          !currentUser
            ? () => {
                activateTooltip('Log in to see their profile!');
                setTimeout(deactivateTooltip, 3000);
              }
            : deactivateTooltip
        }
      >
        <span className="w-fit font-bold">{user.username}</span>
      </ConditionalLink>
    </span>
  );
};
