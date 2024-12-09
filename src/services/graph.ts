import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type GraphResponse = {
  links: {
    source: number;
    target: number;
  }[];
  nodes: {
    avatar_url: string;
    id: number;
    mentions: number;
    username: string;
  }[];
};

export const getGraphData = () =>
  axios
    .get<GraphResponse>(`${process.env.NEXT_PUBLIC_API_URL}/graph`)
    .then((res) => res.data);

export const useGraphData = () =>
  useQuery({
    queryKey: ['graph'],
    queryFn: getGraphData,
    select: (data) => {
      const filteredNodes = data.nodes.filter((node) => {
        return data.links.some(
          (link) => link.source === node.id || link.target === node.id,
        );
      });

      // Sort the filtered nodes by 'mentions' in descending order
      const sortedFilteredNodes = filteredNodes.sort(
        (a, b) => b.mentions - a.mentions,
      );

      const filteredData = {
        nodes: sortedFilteredNodes,
        links: data.links.filter((link) => {
          // Keep only links where both nodes are in the filtered list
          return sortedFilteredNodes.some(
            (node) => node.id === link.source || node.id === link.target,
          );
        }),
      };

      return filteredData;
    },
  });
