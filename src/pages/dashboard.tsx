import { useEffect, useState } from 'react';

import { NewsScreen, TutorialScreen } from '@components/PageComponents/Home';
import useAuth from '@hooks/useAuth';
import type { NewsType } from '@libs/types/influence';
import { useGetInfluences } from '@services/influence';
import type { InferGetStaticPropsType, NextPage } from 'next';
import { readFileSync } from 'node:fs';

const Dashboard: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  news,
}) => {
  useAuth();
  const { data: influenceList } = useGetInfluences();

  const [screen, setScreen] = useState<'Tutorial' | 'News'>('News');

  useEffect(() => {
    if (influenceList && influenceList.length === 0) setScreen('Tutorial');
  }, [influenceList]);

  switch (screen) {
    case 'News':
      return <NewsScreen newsList={news} />;
    case 'Tutorial':
      return (
        <TutorialScreen>
          <button onClick={() => setScreen('News')}>Close tutorial</button>
        </TutorialScreen>
      );
  }
};

export const getStaticProps = async () => {
  const file = readFileSync('src/libs/consts/exampleChangelog.md', 'utf-8');

  const exampleNews: NewsType[] = [
    {
      fullText: file,
      title: 'Version 1.0 is out!',
      date: new Date().toDateString(),
      desc: 'Not really. This is just a placeholder.',
    },
  ];

  return {
    props: {
      news: exampleNews,
    },
  };
};

export default Dashboard;
