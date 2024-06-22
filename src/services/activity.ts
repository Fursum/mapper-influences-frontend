import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';

import axios from 'axios';

import type { BeatmapId } from './influence';

const url = `${process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws')}/ws`;
const backupActivityUrl = `${process.env.NEXT_PUBLIC_API_URL}/activities`;

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

  // Pull the data with from the fallback endpoint if the websocket fails
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (activities.length === 0) {
        try {
          const response = await axios.get<Activity[]>(backupActivityUrl);
          if (response.data) setActivities(response.data);
        } catch (error) {
          console.error('Error fetching fallback data', error);
        }
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [activities]);

  return {
    activities: activities?.toReversed() || [],
    readyState,
    lastMessage,
  };
};
