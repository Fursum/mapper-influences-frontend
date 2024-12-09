import type { NextPage } from 'next';
import dynamic from 'next/dynamic';

const GraphPage = dynamic(
  () => import('src/components/PageComponents/Graph/index'),
  {
    ssr: false,
  },
);

const Graph: NextPage = () => {
  return <GraphPage />;
};

export default Graph;
