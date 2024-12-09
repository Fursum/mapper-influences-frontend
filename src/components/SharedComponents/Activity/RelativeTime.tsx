import { type FC, useEffect, useState } from 'react';

import { relativeTimeText } from '@libs/functions';

const RelativeTime: FC<{
  date: string;
}> = ({ date }) => {
  const [relativeTime, setRelativeTime] = useState<string>(
    relativeTimeText(date),
  );

  useEffect(() => {
    const interval = setInterval(
      () => setRelativeTime(relativeTimeText(date)),
      1000,
    );
    return () => clearInterval(interval);
  }, [date]);

  return <>{relativeTime}</>;
};

export default RelativeTime;
