import { forceCollide } from 'd3-force';
import Link from 'next/link';
import {
  type FC,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ForceGraphMethods, NodeObject } from 'react-force-graph-2d';
import ForceGraph from 'react-force-graph-2d';

import { type GraphResponse, useGraphData } from '@services/graph';

import styles from './style.module.scss';

type NodeExtra = GraphResponse['nodes'][number] & {
  color: string;
  // Pre-baked translucent variants; building template strings inside link
  // accessors allocates per link per frame and causes periodic GC hitches
  colorFaded: string;
  colorSemi: string;
  radius: number;
  community: number;
};
type LinkExtra = { influence_type: number };
type GraphNode = NodeObject<NodeExtra>;
type LinkEnd = string | number | { id?: string | number };
type GraphLink = LinkExtra & {
  source: string | number | GraphNode;
  target: string | number | GraphNode;
};

// Matches the library default (nodeRelSize) so force strengths keep behaving
// the same as the previous nodeVal-based rendering
const NODE_REL_SIZE = 4;

const PALETTE = [
  '#4cc9f0',
  '#f72585',
  '#8ac926',
  '#ffca3a',
  '#ff595e',
  '#1982c4',
  '#c77dff',
  '#ff924c',
  '#52a675',
  '#6a4c93',
  '#f9c74f',
  '#43aa8b',
  '#e63946',
  '#90be6d',
  '#f4a261',
  '#a8dadc',
];

const LEGEND_SIZE = 8;

// Below this zoom level links drop their per-node colors for one flat color,
// which lets the canvas batch all of them into a single stroke pass
const LINK_LOD_ZOOM = 0.35;

// Shared instance — returning a fresh array per link per frame is GC churn
const OUTBOUND_DASH = [2, 2];

// ForceGraph replaces link endpoints (ids) with node object references once
// the simulation starts, so both shapes must be handled
const endId = (end?: LinkEnd): number | undefined => {
  if (end === undefined) return undefined;
  if (typeof end === 'object') return end.id as number;
  return Number(end);
};

// Label propagation: every node repeatedly adopts the most common community
// among its neighbors until stable. Deterministic: fixed iteration order,
// ties break toward the lowest label.
const computeCommunities = (
  nodes: GraphResponse['nodes'],
  links: GraphResponse['links'],
) => {
  const labels = new Map<number, number>();
  const adjacency = new Map<number, number[]>();
  for (const node of nodes) {
    labels.set(node.id, node.id);
    adjacency.set(node.id, []);
  }
  for (const link of links) {
    adjacency.get(link.source)?.push(link.target);
    adjacency.get(link.target)?.push(link.source);
  }

  for (let iteration = 0; iteration < 10; iteration++) {
    let changed = false;
    for (const node of nodes) {
      const counts = new Map<number, number>();
      for (const neighborId of adjacency.get(node.id) ?? []) {
        const label = labels.get(neighborId);
        if (label !== undefined)
          counts.set(label, (counts.get(label) ?? 0) + 1);
      }

      let best = labels.get(node.id) as number;
      let bestCount = 0;
      counts.forEach((count, label) => {
        if (count > bestCount || (count === bestCount && label < best)) {
          best = label;
          bestCount = count;
        }
      });

      if (best !== labels.get(node.id)) {
        labels.set(node.id, best);
        changed = true;
      }
    }
    if (!changed) break;
  }

  return labels;
};

const GraphPage: FC = () => {
  const { data, isLoading } = useGraphData();

  const graphRef = useRef<ForceGraphMethods<GraphNode>>();
  // Read by per-frame link accessors; a ref avoids re-rendering on every
  // zoom event
  const zoomRef = useRef(1);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [activeCommunity, setActiveCommunity] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  // Copies nodes/links because ForceGraph mutates them (layout coordinates,
  // link endpoint object references)
  const graphData = useMemo(() => {
    if (!data) return { nodes: [] as GraphNode[], links: [] as GraphLink[] };

    const labels = computeCommunities(data.nodes, data.links);
    const communitySizes = new Map<number, number>();
    for (const label of Array.from(labels.values())) {
      communitySizes.set(label, (communitySizes.get(label) ?? 0) + 1);
    }
    // Biggest communities claim the palette first; smaller ones cycle it
    const colorByCommunity = new Map(
      Array.from(communitySizes.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([label], index) => [label, PALETTE[index % PALETTE.length]]),
    );

    return {
      nodes: data.nodes.map<GraphNode>((node) => {
        const community = labels.get(node.id) as number;
        const color = colorByCommunity.get(community) ?? '#999';
        return {
          ...node,
          community,
          color,
          colorFaded: `${color}30`,
          colorSemi: `${color}80`,
          radius: Math.sqrt(node.mentions ** 1.7) * NODE_REL_SIZE,
        };
      }),
      links: data.links.map<GraphLink>((link) => ({ ...link })),
    };
  }, [data]);

  const nodeById = useMemo(() => {
    const map = new Map<number, GraphNode>();
    for (const node of graphData.nodes) map.set(node.id as number, node);
    return map;
  }, [graphData]);

  const neighbors = useMemo(() => {
    const map = new Map<number, Set<number>>();
    for (const link of graphData.links) {
      const source = endId(link.source);
      const target = endId(link.target);
      if (source === undefined || target === undefined) continue;
      if (!map.has(source)) map.set(source, new Set());
      if (!map.has(target)) map.set(target, new Set());
      map.get(source)?.add(target);
      map.get(target)?.add(source);
    }
    return map;
  }, [graphData]);

  // Legend: biggest communities, each named after its most mentioned member.
  // Nodes are already sorted by mentions, so the first node seen per
  // community is its figurehead.
  const legend = useMemo(() => {
    const entries = new Map<
      number,
      { community: number; color: string; size: number; topUsername: string }
    >();
    for (const node of graphData.nodes) {
      const existing = entries.get(node.community);
      if (existing) existing.size++;
      else
        entries.set(node.community, {
          community: node.community,
          color: node.color,
          size: 1,
          topUsername: node.username,
        });
    }
    return Array.from(entries.values())
      .sort((a, b) => b.size - a.size)
      .slice(0, LEGEND_SIZE);
  }, [graphData]);

  // Nodes with a highlight ring (directly picked by the user)
  const focusIds = useMemo(() => {
    const set = new Set(selectedIds);
    if (hoverId !== null) set.add(hoverId);
    return set;
  }, [selectedIds, hoverId]);

  // Everything drawn at full opacity; null = no filter active
  const highlightSet = useMemo(() => {
    if (activeCommunity !== null) {
      const set = new Set<number>();
      for (const node of graphData.nodes) {
        if (node.community === activeCommunity) set.add(node.id as number);
      }
      return set;
    }
    if (focusIds.size === 0) return null;
    const set = new Set<number>();
    for (const id of Array.from(focusIds)) {
      set.add(id);
      const linked = neighbors.get(id);
      if (linked) for (const neighborId of Array.from(linked)) set.add(neighborId);
    }
    return set;
  }, [activeCommunity, graphData, focusIds, neighbors]);

  const selectedNodes = useMemo(
    () =>
      selectedIds
        .map((id) => nodeById.get(id))
        .filter((node): node is GraphNode => node !== undefined),
    [selectedIds, nodeById],
  );

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
          // Clamp each endpoint's contribution to [0.025, 0.4]
          Math.min(Math.max(node.source.mentions / 200, 0.025), 0.4) +
          Math.min(Math.max(node.target.mentions / 200, 0.025), 0.4),
      );

      graph
        .d3Force('charge')
        // biome-ignore lint/suspicious/noExplicitAny: idc
        ?.strength((node: any) => -(node.mentions ** 2 * 100) - 100);

      graph.d3Force(
        'collide',
        // biome-ignore lint/suspicious/noExplicitAny: idc
        forceCollide().radius((node: any) => node.mentions ** 1.2 + 5),
      );
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedIds([]);
        setActiveCommunity(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const isFocusedLink = useCallback(
    (link: { source?: LinkEnd; target?: LinkEnd }): boolean => {
      if (focusIds.size === 0) return false;
      const source = endId(link.source);
      const target = endId(link.target);
      return (
        (source !== undefined && focusIds.has(source)) ||
        (target !== undefined && focusIds.has(target))
      );
    },
    [focusIds],
  );

  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      if (node.x === undefined || node.y === undefined) return;
      const dimmed = highlightSet !== null && !highlightSet.has(node.id);
      const screenRadius = node.radius * globalScale;

      // Dimmed nodes below a few pixels are invisible at 0.08 alpha; skipping
      // them keeps hover repaints cheap on large graphs
      if (dimmed && screenRadius < 3) return;

      ctx.globalAlpha = dimmed ? 0.08 : 1;
      ctx.fillStyle = node.color;
      // LOD: sub-2px nodes are drawn as squares — at that size the shape is
      // indistinguishable and skipping the arc keeps zoomed-out frames cheap
      if (screenRadius < 2) {
        ctx.fillRect(
          node.x - node.radius,
          node.y - node.radius,
          node.radius * 2,
          node.radius * 2,
        );
        ctx.globalAlpha = 1;
        return;
      }
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fill();

      if (focusIds.has(node.id as number)) {
        ctx.lineWidth = Math.max(2 / globalScale, node.radius * 0.1);
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }

      // Username under the node: when it is big enough on screen, or when
      // it is part of the highlighted neighborhood
      const showLabel =
        !dimmed &&
        (screenRadius > 12 ||
          (highlightSet !== null &&
            highlightSet.size <= 150 &&
            activeCommunity === null &&
            screenRadius > 4));
      if (showLabel) {
        const fontSize = Math.max(12 / globalScale, node.radius * 0.3);
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.lineWidth = fontSize / 5;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.strokeText(
          node.username,
          node.x,
          node.y + node.radius + fontSize * 0.3,
        );
        ctx.fillStyle = '#ffffff';
        ctx.fillText(
          node.username,
          node.x,
          node.y + node.radius + fontSize * 0.3,
        );
      }
      ctx.globalAlpha = 1;
    },
    [highlightSet, focusIds, activeCommunity],
  );

  const paintPointerArea = useCallback(
    (
      node: GraphNode,
      color: string,
      ctx: CanvasRenderingContext2D,
      globalScale: number,
    ) => {
      if (node.x === undefined || node.y === undefined) return;
      ctx.fillStyle = color;
      const hitRadius = node.radius + 1;
      if (node.radius * globalScale < 2) {
        ctx.fillRect(
          node.x - hitRadius,
          node.y - hitRadius,
          hitRadius * 2,
          hitRadius * 2,
        );
        return;
      }
      ctx.beginPath();
      ctx.arc(node.x, node.y, hitRadius, 0, 2 * Math.PI);
      ctx.fill();
    },
    [],
  );

  const toggleSelect = useCallback((id: number, additive: boolean) => {
    setActiveCommunity(null);
    setSelectedIds((previous) => {
      if (additive)
        return previous.includes(id)
          ? previous.filter((existing) => existing !== id)
          : [...previous, id];
      return previous.length === 1 && previous[0] === id ? [] : [id];
    });
  }, []);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = search.trim().toLowerCase();
    if (!query) return;

    // Nodes are sorted by mentions, so the most notable match wins
    const match =
      graphData.nodes.find((node) => node.username.toLowerCase() === query) ??
      graphData.nodes.find((node) =>
        node.username.toLowerCase().includes(query),
      );
    if (match && match.x !== undefined && match.y !== undefined) {
      const id = match.id as number;
      setActiveCommunity(null);
      setSelectedIds((previous) =>
        previous.includes(id) ? previous : [...previous, id],
      );
      setSearch('');
      graphRef.current?.centerAt(match.x, match.y, 600);
      graphRef.current?.zoom(2.5, 600);
    }
  };

  return (
    <div className={styles.graphPage}>
      {isLoading && <p className={styles.loading}>Loading...</p>}

      <form className={styles.searchBar} onSubmit={handleSearch}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search mapper..."
          aria-label="Search mapper"
        />
        <span className={styles.hint}>
          Enter adds to selection · Ctrl+click multi-selects · Esc clears
        </span>
      </form>

      {selectedNodes.length > 0 && (
        <aside className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              Selected · {selectedNodes.length}
            </span>
            <button
              type="button"
              className={styles.clearAll}
              onClick={() => setSelectedIds([])}
            >
              Clear all
            </button>
          </div>
          <ul className={styles.selectedList}>
            {selectedNodes.map((node) => (
              <li
                key={node.id}
                className={styles.selectedUser}
                onMouseEnter={() => setHoverId(node.id as number)}
                onMouseLeave={() => setHoverId(null)}
              >
                <img
                  src={node.avatar_url}
                  alt={node.username}
                  style={{ borderColor: node.color }}
                />
                <div className={styles.info}>
                  <Link
                    href={`/profile/${node.id}`}
                    className={styles.username}
                  >
                    {node.username}
                  </Link>
                  <span className={styles.stats}>
                    Influenced {node.mentions} · Influenced by{' '}
                    {node.influenced_by ?? 0}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.close}
                  onClick={() =>
                    setSelectedIds((previous) =>
                      previous.filter((id) => id !== node.id),
                    )
                  }
                  aria-label={`Deselect ${node.username}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <aside className={styles.legend}>
        <span className={styles.legendTitle}>Communities</span>
        {legend.map((entry) => (
          <button
            type="button"
            key={entry.community}
            className={
              activeCommunity === entry.community ? styles.active : undefined
            }
            onClick={() =>
              setActiveCommunity((previous) =>
                previous === entry.community ? null : entry.community,
              )
            }
          >
            <span
              className={styles.swatch}
              style={{ backgroundColor: entry.color }}
            />
            {entry.topUsername}
            <span className={styles.count}>+{entry.size - 1}</span>
          </button>
        ))}
        <span className={styles.legendHint}>
          Auto-detected clusters, named after their most mentioned mapper.
          Links take the color of the mapper who declared the influence.
        </span>
      </aside>

      <ForceGraph<NodeExtra, LinkExtra>
        graphData={graphData}
        nodeRelSize={NODE_REL_SIZE}
        nodeVal={(node) => node.mentions ** 1.7}
        nodeLabel={(node) => `${node.username} - ${node.mentions}`}
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={paintPointerArea}
        // Non-matching links are hidden (not drawn faintly) while a filter is
        // active — stroking thousands of near-invisible links made every
        // hover repaint expensive
        linkVisibility={(link) => {
          if (activeCommunity !== null) {
            return (
              typeof link.source === 'object' &&
              typeof link.target === 'object' &&
              link.source.community === activeCommunity &&
              link.target.community === activeCommunity
            );
          }
          if (focusIds.size > 0) return isFocusedLink(link);
          return true;
        }}
        linkColor={(link) => {
          const source =
            typeof link.source === 'object' ? link.source : undefined;
          if (activeCommunity !== null) return source?.colorSemi ?? '#999';
          if (focusIds.size > 0) return source?.color ?? '#999';
          if (zoomRef.current < LINK_LOD_ZOOM)
            return 'rgba(140, 140, 140, 0.15)';
          return source?.colorFaded ?? 'rgba(128, 128, 128, 0.1)';
        }}
        linkWidth={(link) => (isFocusedLink(link) ? 2 : 0.2)}
        linkLineDash={(link) => {
          // Outbound from selected/hovered nodes (influences they added)
          // render dotted; inbound stay solid
          if (focusIds.size === 0) return null;
          const target = endId(link.target);
          return target !== undefined && focusIds.has(target)
            ? OUTBOUND_DASH
            : null;
        }}
        maxZoom={10}
        enableNodeDrag={false}
        warmupTicks={5}
        cooldownTicks={100}
        autoPauseRedraw
        onZoom={(transform) => {
          zoomRef.current = transform.k;
        }}
        onNodeClick={(node, event) => {
          toggleSelect(
            node.id as number,
            event.ctrlKey || event.metaKey || event.shiftKey,
          );
          if (node.x !== undefined && node.y !== undefined)
            graphRef.current?.centerAt(node.x, node.y, 400);
        }}
        onNodeHover={(node) => setHoverId(node ? (node.id as number) : null)}
        onBackgroundClick={() => {
          setSelectedIds([]);
          setActiveCommunity(null);
        }}
        ref={graphRef}
        height={window?.innerHeight - 90}
      />
    </div>
  );
};

export default GraphPage;
