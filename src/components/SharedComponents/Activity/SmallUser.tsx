import type { FC } from 'react';

import { useCurrentUser } from '@services/user';

import ConditionalLink from '../ConditionalLink';
import ProfilePhoto from '../ProfilePhoto';

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

export default SmallUser;
