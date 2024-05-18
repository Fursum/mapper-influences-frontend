import { useEffect, useState } from 'react';

import { NewsScreen, TutorialScreen } from '@components/PageComponents/Home';
import useAuth from '@hooks/useAuth';
import { useGetInfluences } from '@services/influence';
import type { NextPage } from 'next';

const Dashboard: NextPage = () => {
  useAuth();
  const { data: influenceList } = useGetInfluences();

  const [screen, setScreen] = useState<'Tutorial' | 'News'>('News');

  useEffect(() => {
    if (influenceList && influenceList.length === 0) setScreen('Tutorial');
  }, [influenceList]);

  switch (screen) {
    case 'News':
      return <NewsScreen />;
    case 'Tutorial':
      return (
        <TutorialScreen>
          <button onClick={() => setScreen('News')}>Close tutorial</button>
        </TutorialScreen>
      );
  }
};

export default Dashboard;
