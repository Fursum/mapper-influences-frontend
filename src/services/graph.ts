import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type GraphResponse = {
  links: {
    source: number;
    target: number;
    influence_type: number;
  }[];
  nodes: {
    avatar_url: string;
    id: number;
    mentions: number;
    influenced_by: number;
    username: string;
  }[];
};

export const getGraphData = () =>
  axios
    .get<GraphResponse>(`${process.env.NEXT_PUBLIC_API_URL}/graph`)
    .then((res) => res.data);

// Module-level so react-query can memoize the result between renders.
// The backend only returns users with at least one influence edge, so no
// client-side node filtering is needed. Dropping links with missing
// endpoints is a safety net (O(N + L)).
const selectGraphData = (data: GraphResponse) => {
  const nodeIds = new Set(data.nodes.map((node) => node.id));

  return {
    // Copy before sorting to avoid mutating the react-query cache
    nodes: [...data.nodes].sort((a, b) => b.mentions - a.mentions),
    links: data.links.filter(
      (link) => nodeIds.has(link.source) && nodeIds.has(link.target),
    ),
  };
};

export const useGraphData = () =>
  useQuery({
    queryKey: ['graph'],
    queryFn: getGraphData,
    select: selectGraphData,
  });
