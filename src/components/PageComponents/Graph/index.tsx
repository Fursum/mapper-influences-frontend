import { forceCollide, forceX, forceY } from 'd3-force';
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
import type {
  ForceGraphMethods,
  LinkObject,
  NodeObject,
} from 'react-force-graph-2d';
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
type GraphLink = LinkObject<NodeExtra, LinkExtra>;
type LinkEnd = GraphLink['source'];

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

// Shared instance — returning a fresh array per link per frame is GC churn
const OUTBOUND_DASH = [2, 2];

// Bump the version whenever force configuration changes, so stale layouts
// computed under old physics are discarded
const LAYOUT_CACHE_KEY = 'mapper-influences:graph-layout:v1';

// Base resolution label sprites are rasterized at; on-screen labels are this
// sprite scaled, so past ~48px they soften slightly
const LABEL_SPRITE_FONT_PX = 48;

// High-DPI screens quadruple canvas fill cost; capping the ratio trades a
// hint of sharpness for half the pixels or better on 2x displays
const DEVICE_PIXEL_RATIO_CAP = 1.5;

const capDevicePixelRatio = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  if ((window.devicePixelRatio || 1) <= DEVICE_PIXEL_RATIO_CAP)
    return () => {};
  const descriptor = Object.getOwnPropertyDescriptor(
    window,
    'devicePixelRatio',
  );
  Object.defineProperty(window, 'devicePixelRatio', {
    get: () => DEVICE_PIXEL_RATIO_CAP,
    configurable: true,
  });
  return () => {
    if (descriptor)
      Object.defineProperty(window, 'devicePixelRatio', descriptor);
    else Reflect.deleteProperty(window, 'devicePixelRatio');
  };
};

// ForceGraph replaces link endpoints (ids) with node object references once
// the simulation starts, so both shapes must be handled
const endId = (end?: LinkEnd): number | undefined => {
  if (end === undefined) return undefined;
  if (typeof end === 'object') return end.id as number;
  return Number(end);
};

const nodeVal = (node: GraphNode) => node.mentions ** 1.7;
const nodeTooltip = (node: GraphNode) => `${node.username} - ${node.mentions}`;

// Link hover/click is unused, so painting every link onto the interaction
// shadow canvas is wasted work
const skipLinkPointerPaint = () => {};

const hashGraphData = (data: GraphResponse) => {
  let hash = 5381;
  const mix = (value: number) => {
    hash = ((hash * 33) ^ value) >>> 0;
  };
  for (const node of data.nodes) {
    mix(node.id);
    mix(node.mentions);
  }
  for (const link of data.links) {
    mix(link.source * 31 + link.target);
  }
  return hash;
};

type StoredLayout = { hash: number; positions: [number, number, number][] };

const loadCachedLayout = (hash: number): Map<number, [number, number]> | null => {
  try {
    const raw = localStorage.getItem(LAYOUT_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredLayout;
    if (parsed.hash !== hash || !Array.isArray(parsed.positions)) return null;
    return new Map(
      parsed.positions.map(([id, x, y]) => [id, [x, y] as [number, number]]),
    );
  } catch {
    return null;
  }
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

// Focus/highlight state lives in refs and is read by stable canvas accessors:
// hovering repaints the canvas directly without a React render, which was
// re-diffing every accessor prop per hover change
type ViewState = {
  focusIds: Set<number>;
  highlightSet: Set<number> | null;
  activeCommunity: number | null;
};

const GraphPage: FC = () => {
  const { data, isLoading } = useGraphData();

  const graphRef = useRef<ForceGraphMethods<GraphNode>>();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeCommunity, setActiveCommunity] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  // Applied before the canvas mounts so it sizes itself at the capped ratio
  const [restoreDevicePixelRatio] = useState(() => capDevicePixelRatio());
  useEffect(() => restoreDevicePixelRatio, [restoreDevicePixelRatio]);

  // Copies nodes/links because ForceGraph mutates them (layout coordinates,
  // link endpoint object references)
  const { graphData, layoutHash, layoutFromCache } = useMemo(() => {
    if (!data)
      return {
        graphData: { nodes: [] as GraphNode[], links: [] as GraphLink[] },
        layoutHash: 0,
        layoutFromCache: false,
      };

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

    const hash = hashGraphData(data);
    const cachedPositions = loadCachedLayout(hash);

    const nodes = data.nodes.map<GraphNode>((node) => {
      const community = labels.get(node.id) as number;
      const color = colorByCommunity.get(community) ?? '#999';
      const position = cachedPositions?.get(node.id);
      return {
        ...node,
        community,
        color,
        colorFaded: `${color}30`,
        colorSemi: `${color}80`,
        radius: Math.sqrt(node.mentions ** 1.7) * NODE_REL_SIZE,
        ...(position ? { x: position[0], y: position[1] } : {}),
      };
    });

    return {
      graphData: {
        nodes,
        links: data.links.map<GraphLink>((link) => ({ ...link })),
      },
      layoutHash: hash,
      layoutFromCache:
        cachedPositions !== null &&
        data.nodes.every((node) => cachedPositions.has(node.id)),
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

  const selectedNodes = useMemo(
    () =>
      selectedIds
        .map((id) => nodeById.get(id))
        .filter((node): node is GraphNode => node !== undefined),
    [selectedIds, nodeById],
  );

  const viewRef = useRef<ViewState>({
    focusIds: new Set(),
    highlightSet: null,
    activeCommunity: null,
  });
  const hoverRef = useRef<number | null>(null);
  const selectedRef = useRef<number[]>([]);
  const communityRef = useRef<number | null>(null);
  const dataRef = useRef({
    nodes: graphData.nodes,
    neighbors,
    layoutHash,
  });
  const labelSprites = useRef(new Map<number, HTMLCanvasElement | null>());

  // Rebuilds the focus/highlight sets from the refs and nudges the canvas
  // into a repaint (the library only redraws on prop changes or interaction)
  const refreshView = useCallback(() => {
    const { nodes, neighbors: neighborMap } = dataRef.current;
    const focusIds = new Set(selectedRef.current);
    if (hoverRef.current !== null) focusIds.add(hoverRef.current);
    const community = communityRef.current;

    let highlightSet: Set<number> | null = null;
    if (community !== null) {
      highlightSet = new Set<number>();
      for (const node of nodes) {
        if (node.community === community)
          highlightSet.add(node.id as number);
      }
    } else if (focusIds.size > 0) {
      highlightSet = new Set<number>();
      for (const id of Array.from(focusIds)) {
        highlightSet.add(id);
        const linked = neighborMap.get(id);
        if (linked)
          for (const neighborId of Array.from(linked))
            highlightSet.add(neighborId);
      }
    }

    viewRef.current = { focusIds, highlightSet, activeCommunity: community };

    const graph = graphRef.current;
    if (graph) {
      try {
        // Re-centering on the current center is a no-op visually but flags
        // the canvas as needing a redraw
        const center = graph.centerAt();
        graph.centerAt(center.x, center.y);
      } catch {
        // Canvas not initialized yet; the first natural draw will pick up
        // the current view state
      }
    }
  }, []);

  useEffect(() => {
    dataRef.current = { nodes: graphData.nodes, neighbors, layoutHash };
    labelSprites.current.clear();
    selectedRef.current = selectedIds;
    communityRef.current = activeCommunity;
    refreshView();
  }, [graphData, neighbors, layoutHash, selectedIds, activeCommunity, refreshView]);

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

      // Weight-based gravity replaces the uniform centering force: heavily
      // mentioned mappers are pulled to the middle, small nodes barely at
      // all, so repulsion pushes them to the rim instead of letting them
      // pool in the center
      // biome-ignore lint/suspicious/noExplicitAny: idc
      const centerPull = (node: any) =>
        Math.min(node.mentions / 100, 1) * 0.1 + 0.003;
      graph.d3Force('center', null);
      graph.d3Force('x', forceX(0).strength(centerPull));
      graph.d3Force('y', forceY(0).strength(centerPull));
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

  const saveLayout = useCallback(() => {
    const { nodes, layoutHash: hash } = dataRef.current;
    if (nodes.length === 0) return;
    try {
      const positions = nodes.map<[number, number, number]>((node) => [
        node.id as number,
        Math.round(node.x ?? 0),
        Math.round(node.y ?? 0),
      ]);
      localStorage.setItem(
        LAYOUT_CACHE_KEY,
        JSON.stringify({ hash, positions } satisfies StoredLayout),
      );
    } catch {
      // Storage full or unavailable — layout just recomputes next visit
    }
  }, []);

  const isFocusedLink = useCallback((link: GraphLink): boolean => {
    const { focusIds } = viewRef.current;
    if (focusIds.size === 0) return false;
    const source = endId(link.source);
    const target = endId(link.target);
    return (
      (source !== undefined && focusIds.has(source)) ||
      (target !== undefined && focusIds.has(target))
    );
  }, []);

  // Non-matching links are hidden (not drawn faintly) while a filter is
  // active — stroking thousands of near-invisible links made every hover
  // repaint expensive
  const linkVisibility = useCallback(
    (link: GraphLink) => {
      const { focusIds, activeCommunity: community } = viewRef.current;
      if (community !== null) {
        return (
          typeof link.source === 'object' &&
          typeof link.target === 'object' &&
          link.source.community === community &&
          link.target.community === community
        );
      }
      if (focusIds.size > 0) return isFocusedLink(link);
      return true;
    },
    [isFocusedLink],
  );

  const linkColor = useCallback(
    (link: GraphLink) => {
      const { focusIds, activeCommunity: community } = viewRef.current;
      const source = typeof link.source === 'object' ? link.source : undefined;
      if (community !== null) return source?.colorSemi ?? '#999';
      if (focusIds.size > 0) return source?.color ?? '#999';
      return source?.colorFaded ?? 'rgba(128, 128, 128, 0.1)';
    },
    [],
  );

  const linkWidth = useCallback(
    (link: GraphLink) => (isFocusedLink(link) ? 2 : 0.2),
    [isFocusedLink],
  );

  const linkLineDash = useCallback((link: GraphLink) => {
    // Outbound from selected/hovered nodes (influences they added) render
    // dotted; inbound stay solid
    const { focusIds } = viewRef.current;
    if (focusIds.size === 0) return null;
    const target = endId(link.target);
    return target !== undefined && focusIds.has(target) ? OUTBOUND_DASH : null;
  }, []);

  // Usernames rasterize once into an offscreen sprite; per-frame label cost
  // becomes a drawImage instead of strokeText/fillText (the slowest canvas
  // primitives)
  const getLabelSprite = useCallback((node: GraphNode) => {
    const cache = labelSprites.current;
    const id = node.id as number;
    let sprite = cache.get(id);
    if (sprite === undefined) {
      sprite = null;
      const canvas = document.createElement('canvas');
      const spriteCtx = canvas.getContext('2d');
      if (spriteCtx) {
        const font = `${LABEL_SPRITE_FONT_PX}px Sans-Serif`;
        spriteCtx.font = font;
        canvas.width = Math.ceil(
          spriteCtx.measureText(node.username).width + LABEL_SPRITE_FONT_PX / 2,
        );
        canvas.height = Math.ceil(LABEL_SPRITE_FONT_PX * 1.4);
        spriteCtx.font = font;
        spriteCtx.textAlign = 'center';
        spriteCtx.textBaseline = 'top';
        spriteCtx.lineWidth = LABEL_SPRITE_FONT_PX / 5;
        spriteCtx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
        spriteCtx.strokeText(
          node.username,
          canvas.width / 2,
          LABEL_SPRITE_FONT_PX * 0.15,
        );
        spriteCtx.fillStyle = '#ffffff';
        spriteCtx.fillText(
          node.username,
          canvas.width / 2,
          LABEL_SPRITE_FONT_PX * 0.15,
        );
        sprite = canvas;
      }
      cache.set(id, sprite);
    }
    return sprite;
  }, []);

  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      if (node.x === undefined || node.y === undefined) return;
      const { focusIds, highlightSet, activeCommunity: community } =
        viewRef.current;
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
            community === null &&
            screenRadius > 4));
      if (showLabel) {
        const sprite = getLabelSprite(node);
        if (sprite) {
          const fontSize = Math.max(12 / globalScale, node.radius * 0.3);
          const scale = fontSize / LABEL_SPRITE_FONT_PX;
          ctx.drawImage(
            sprite,
            node.x - (sprite.width * scale) / 2,
            node.y +
              node.radius +
              fontSize * 0.3 -
              LABEL_SPRITE_FONT_PX * 0.15 * scale,
            sprite.width * scale,
            sprite.height * scale,
          );
        }
      }
      ctx.globalAlpha = 1;
    },
    [getLabelSprite],
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

  const handleNodeHover = useCallback(
    (node: GraphNode | null) => {
      hoverRef.current = node ? (node.id as number) : null;
      refreshView();
    },
    [refreshView],
  );

  const handleNodeClick = useCallback(
    (node: GraphNode, event: MouseEvent) => {
      toggleSelect(
        node.id as number,
        event.ctrlKey || event.metaKey || event.shiftKey,
      );
      if (node.x !== undefined && node.y !== undefined)
        graphRef.current?.centerAt(node.x, node.y, 400);
    },
    [toggleSelect],
  );

  const handleBackgroundClick = useCallback(() => {
    setSelectedIds([]);
    setActiveCommunity(null);
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

  const hoverFromList = useCallback(
    (id: number | null) => {
      hoverRef.current = id;
      refreshView();
    },
    [refreshView],
  );

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
                onMouseEnter={() => hoverFromList(node.id as number)}
                onMouseLeave={() => hoverFromList(null)}
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
        nodeVal={nodeVal}
        nodeLabel={nodeTooltip}
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={paintPointerArea}
        linkVisibility={linkVisibility}
        linkColor={linkColor}
        linkWidth={linkWidth}
        linkLineDash={linkLineDash}
        linkPointerAreaPaint={skipLinkPointerPaint}
        maxZoom={10}
        enableNodeDrag={false}
        warmupTicks={layoutFromCache ? 0 : 5}
        cooldownTicks={layoutFromCache ? 0 : 100}
        autoPauseRedraw
        onEngineStop={saveLayout}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onBackgroundClick={handleBackgroundClick}
        ref={graphRef}
        height={window?.innerHeight - 90}
      />
    </div>
  );
};

export default GraphPage;
