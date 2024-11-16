import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';

import type { Activity } from '@libs/types/activity';
import axios from 'axios';

const url = `${process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws')}/ws`;
const backupActivityUrl = `${process.env.NEXT_PUBLIC_API_URL}/activity`;

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
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [activities]);

  return {
    activities: activities?.toReversed() || [],
    readyState,
    lastMessage,
  };
};
