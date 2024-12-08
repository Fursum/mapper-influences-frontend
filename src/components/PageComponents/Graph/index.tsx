import { type FC, useEffect, useRef } from 'react';
import type { ForceGraphMethods } from 'react-force-graph-2d';
import ForceGraph from 'react-force-graph-2d';

import { useGraphData } from '@services/graph';

const GraphPage: FC = () => {
  const { data: graphData, isLoading } = useGraphData();

  const graphRef = useRef<ForceGraphMethods>();

  useEffect(() => {
    const graph = graphRef.current;
    if (graph) {
      graph
        .d3Force('link')
        // biome-ignore lint/suspicious/noExplicitAny: idc
        ?.distance((node: any) => 3000 / (node.source.mentions || 1));
      // TODO: Add influence type for the link distance and strength
      graph.d3Force('link')?.strength(
        // biome-ignore lint/suspicious/noExplicitAny: idc
        (node: any) =>
          Math.max(Math.min(node.source.mentions / 200, 0.025), 0.4) +
          Math.max(Math.min(node.target.mentions / 200, 0.025), 0.4),
      );

      graph
        .d3Force('charge')
        // biome-ignore lint/suspicious/noExplicitAny: idc
        ?.strength((node: any) => -(node.mentions ** 2 * 100) - 100);

      // biome-ignore lint/suspicious/noExplicitAny: idc
      graph.d3Force('collide')?.radius((node: any) => node.mentions ** 1.2 + 5);
    }
  }, []);

  return (
    <>
      {isLoading && <p>Loading...</p>}
      <ForceGraph
        graphData={graphData}
        nodeAutoColorBy="id"
        linkAutoColorBy="target"
        linkWidth={0.05}
        nodeVal={(node) => node.mentions ** 1.7} // Exponential scaling for node size
        nodeLabel={(node) => `${node.username} - ${node.mentions}`}
        maxZoom={10}
        enableNodeDrag={false}
        warmupTicks={5}
        cooldownTicks={100}
        ref={graphRef}
        height={window?.innerHeight - 90}
      />
    </>
  );
};

export default GraphPage;
