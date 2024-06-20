import { type FC, useEffect, useReducer } from 'react';

import { relativeTimeText } from '@libs/functions';

const RelativeTime: FC<{
  date: string;
}> = ({ date }) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const interval = setInterval(forceUpdate, 1000);
    return () => clearInterval(interval);
  }, []);

  const relativeTime = relativeTimeText(date);

  return <>{relativeTime}</>;
};

export default RelativeTime;
