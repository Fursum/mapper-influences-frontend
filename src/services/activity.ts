import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';

import type { BeatmapId } from './influence';

const url = `${process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws')}/ws`;

export type ShortUser = {
  id: number;
  username: string;
  avatar_url: string;
  country: string; // Short code
};

export type Activity = {
  type:
    | 'LOGIN'
    | 'EDIT_BIO'
    | 'ADD_BEATMAP'
    | 'REMOVE_BEATMAP'
    | 'ADD_INFLUENCE'
    | 'REMOVE_INFLUENCE';
  user: ShortUser;
  datetime: string; // ISO string
  details: {
    influenced_to: ShortUser | null;
    beatmap: BeatmapId | null;
    description: string | null;
  };
};

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  const { readyState, lastMessage } = useWebSocket<Activity>(url);

  useEffect(() => {
    if (!lastMessage?.data) return;
    const lastMessageParsed = JSON.parse(lastMessage.data);

    if (Array.isArray(lastMessageParsed)) {
      setActivities((prev) => [...prev, ...lastMessageParsed]);
      return;
    }

    setActivities((prev) => [...prev, lastMessageParsed]);
  }, [lastMessage?.data]);

  return {
    activities: activities?.toReversed() || [],
    readyState,
    lastMessage,
  };
};
