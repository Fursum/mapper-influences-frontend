import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';

import type { Activity } from '@libs/types/activity';
import axios from 'axios';

const url = `${process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws')}/ws`;
const backupActivityUrl = `${process.env.NEXT_PUBLIC_API_URL}/activity`;

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  // Without shouldReconnect, the library never reconnects after a drop
  const { readyState, lastMessage } = useWebSocket<Activity>(url, {
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (!lastMessage?.data) return;
    const lastMessageParsed = JSON.parse(lastMessage.data);
    const incoming: Activity[] = Array.isArray(lastMessageParsed)
      ? lastMessageParsed
      : [lastMessageParsed];

    // A reconnect sends the initial batch again, so skip known ids
    setActivities((prev) => {
      const knownIds = new Set(prev.map((activity) => activity.id));
      return [
        ...prev,
        ...incoming.filter((activity) => !knownIds.has(activity.id)),
      ];
    });
  }, [lastMessage?.data]);

  // Pull the data from the fallback endpoint if the websocket fails.
  // Keyed on emptiness, not the array, so an empty response does not
  // start the timer again in a loop.
  const isEmpty = activities.length === 0;
  useEffect(() => {
    if (!isEmpty) return;
    const timeoutId = setTimeout(() => {
      axios
        .get<Activity[]>(backupActivityUrl)
        .then((res) => {
          // Do not replace websocket data that arrived during the request
          setActivities((prev) => (prev.length ? prev : res.data));
        })
        .catch((err) => {
          console.warn('Error fetching fallback data', err);
        });
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [isEmpty]);

  return {
    activities: activities?.toReversed() || [],
    readyState,
    lastMessage,
  };
};
