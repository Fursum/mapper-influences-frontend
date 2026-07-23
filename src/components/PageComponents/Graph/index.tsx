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
import { useGlobalTheme } from '@states/theme';

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
type LinkExtra = { influence_type: number; mutual: boolean };
type GraphNode = NodeObject<NodeExtra>;
type GraphLink = LinkObject<NodeExtra, LinkExtra>;
type LinkEnd = GraphLink['source'];

// Matches the library default (nodeRelSize) so force strengths keep behaving
// the same as the previous nodeVal-based rendering
const NODE_REL_SIZE = 4;

// Bright set for dark backgrounds; same hue order darkened for light mode,
// where the bright set washes out
const DARK_THEME_PALETTE = [
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
const LIGHT_THEME_PALETTE = [
  '#147ca3',
  '#b91c68',
  '#557d0e',
  '#a67c00',
  '#c62828',
  '#10527e',
  '#7b2fbf',
  '#c05e14',
  '#2e6b4a',
  '#4a2f6e',
  '#9c7a10',
  '#22705a',
  '#a4161a',
  '#4f7a35',
  '#b3641f',
  '#4d8a8c',
];

const LEGEND_SIZE = 8;

// Shared mutable instances used by the hover overlay — rescaled in place
// each frame instead of allocating
const OVERLAY_DASH: [number, number] = [4, 3];
const EMPTY_DASH: number[] = [];

// Overlay label cap: neighborhoods larger than this only label the focused
// nodes themselves
const NEIGHBOR_LABEL_LIMIT = 150;

// Max label sprites rasterized per frame; the rest appear on later frames.
// Prevents a burst of canvas text rasterization on the first hover of a hub.
const SPRITE_BUDGET_PER_FRAME = 24;

// Bump the version whenever force configuration changes, so stale layouts
// computed under old physics are discarded
const LAYOUT_CACHE_KEY = 'mapper-influences:graph-layout:v8';

// Single source of truth for the collision sphere, shared by the live force
// and the post-settle cleanup pass
// biome-ignore lint/suspicious/noExplicitAny: d3 node
const collideRadius = (node: any) => node.radius * 1.4 + 20;

// The simulation can end with a handful of unresolved contacts (dense
// clusters, alpha running out). This runs pure collision passes on the
// settled positions until nothing moves, guaranteeing separation before the
// layout is drawn and cached.
const resolveResidualOverlaps = (nodes: GraphNode[]) => {
  const resolver = forceCollide()
    .radius(collideRadius)
    .strength(1)
    .iterations(4);
  // d3-force v3 initialize requires a random source (used to jiggle exactly
  // coincident nodes); a seeded LCG keeps the pass deterministic
  let seed = 1;
  const seededRandom = () => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };
  // biome-ignore lint/suspicious/noExplicitAny: d3 force typing
  (resolver as any).initialize(nodes, seededRandom);
  for (let pass = 0; pass < 40; pass++) {
    for (const node of nodes) {
      node.vx = 0;
      node.vy = 0;
    }
    resolver(1);
    let moved = 0;
    for (const node of nodes) {
      node.x = (node.x ?? 0) + (node.vx ?? 0);
      node.y = (node.y ?? 0) + (node.vy ?? 0);
      moved += Math.abs(node.vx ?? 0) + Math.abs(node.vy ?? 0);
    }
    if (moved < 0.5) break;
  }
  for (const node of nodes) {
    node.vx = 0;
    node.vy = 0;
  }
};

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

// Rasterizes a username once; per-frame label drawing is then a drawImage.
// Dark theme: white text with dark outline; light theme: inverted.
const buildLabelSprite = (
  username: string,
  darkTheme: boolean,
): HTMLCanvasElement | null => {
  const canvas = document.createElement('canvas');
  const spriteCtx = canvas.getContext('2d');
  if (!spriteCtx) return null;
  const font = `${LABEL_SPRITE_FONT_PX}px Sans-Serif`;
  spriteCtx.font = font;
  canvas.width = Math.ceil(
    spriteCtx.measureText(username).width + LABEL_SPRITE_FONT_PX / 2,
  );
  canvas.height = Math.ceil(LABEL_SPRITE_FONT_PX * 1.4);
  spriteCtx.font = font;
  spriteCtx.textAlign = 'center';
  spriteCtx.textBaseline = 'top';
  spriteCtx.lineWidth = LABEL_SPRITE_FONT_PX / 5;
  spriteCtx.strokeStyle = darkTheme
    ? 'rgba(0, 0, 0, 0.75)'
    : 'rgba(255, 255, 255, 0.85)';
  spriteCtx.strokeText(username, canvas.width / 2, LABEL_SPRITE_FONT_PX * 0.15);
  spriteCtx.fillStyle = darkTheme ? '#ffffff' : '#1a1a1a';
  spriteCtx.fillText(username, canvas.width / 2, LABEL_SPRITE_FONT_PX * 0.15);
  return canvas;
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

  const isDarkTheme = useGlobalTheme((state) => state.theme) !== 'light';

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
    const palette = isDarkTheme ? DARK_THEME_PALETTE : LIGHT_THEME_PALETTE;
    const colorByCommunity = new Map(
      Array.from(communitySizes.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([label], index) => [label, palette[index % palette.length]]),
    );

    const hash = hashGraphData(data);
    const cachedPositions = loadCachedLayout(hash);

    const nodes = data.nodes.map<GraphNode>((node, index) => {
      const community = labels.get(node.id) as number;
      const color = colorByCommunity.get(community) ?? '#999';
      // Deterministic start instead of d3's default: nodes are sorted by
      // mentions, so a phyllotaxis spiral by rank seeds the most influential
      // mappers in the middle and small ones on the outside — they never
      // begin (or end up trapped) in the center
      const spiralAngle = index * 2.399963229728653;
      const spiralRadius = 60 * Math.sqrt(index);
      const position = cachedPositions?.get(node.id) ?? [
        Math.cos(spiralAngle) * spiralRadius,
        Math.sin(spiralAngle) * spiralRadius,
      ];
      return {
        ...node,
        community,
        color,
        colorFaded: `${color}30`,
        colorSemi: `${color}80`,
        radius: Math.sqrt(node.mentions ** 1.7) * NODE_REL_SIZE,
        x: position[0],
        y: position[1],
      };
    });

    // A pair is mutual when both directions were declared
    const directedPairs = new Set<string>();
    for (const link of data.links)
      directedPairs.add(`${link.source}>${link.target}`);

    return {
      graphData: {
        nodes,
        links: data.links.map<GraphLink>((link) => ({
          ...link,
          mutual: directedPairs.has(`${link.target}>${link.source}`),
        })),
      },
      layoutHash: hash,
      layoutFromCache:
        cachedPositions !== null &&
        data.nodes.every((node) => cachedPositions.has(node.id)),
    };
  }, [data, isDarkTheme]);

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

  // Same link objects the library mutates, indexed per endpoint, so the
  // hover overlay can draw a node's links without scanning the full list
  const linksByNode = useMemo(() => {
    const map = new Map<number, GraphLink[]>();
    for (const link of graphData.links) {
      const source = endId(link.source);
      const target = endId(link.target);
      if (source === undefined || target === undefined) continue;
      if (!map.has(source)) map.set(source, []);
      if (!map.has(target)) map.set(target, []);
      map.get(source)?.push(link);
      map.get(target)?.push(link);
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
    linksByNode,
    nodeById,
    layoutHash,
  });
  const labelSprites = useRef(new Map<number, HTMLCanvasElement | null>());
  const themeRef = useRef(true);
  // Wash color for the hover overlay dim — the page background with high
  // alpha, so "dimmed" elements fade toward the background like before
  const dimWashRef = useRef('rgba(0, 0, 0, 0.85)');

  // Rebuilds the focus/highlight sets from the refs and nudges the canvas
  // into a repaint (the library only redraws on prop changes or interaction)
  const refreshView = useCallback(() => {
    const { nodes } = dataRef.current;
    const focusIds = new Set(selectedRef.current);
    if (hoverRef.current !== null) focusIds.add(hoverRef.current);
    const community = communityRef.current;

    // Focus highlighting is drawn as an overlay, so highlightSet only serves
    // the community filter (which restyles the base render)
    let highlightSet: Set<number> | null = null;
    if (community !== null) {
      highlightSet = new Set<number>();
      for (const node of nodes) {
        if (node.community === community)
          highlightSet.add(node.id as number);
      }
    }

    if (focusIds.size > 0) {
      const background = getComputedStyle(document.body).backgroundColor;
      const channels = background.match(/\d+(\.\d+)?/g);
      if (channels && channels.length >= 3 && background !== 'rgba(0, 0, 0, 0)')
        dimWashRef.current = `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, 0.85)`;
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
    if (
      dataRef.current.nodes !== graphData.nodes ||
      themeRef.current !== isDarkTheme
    )
      labelSprites.current.clear();
    themeRef.current = isDarkTheme;
    dataRef.current = {
      nodes: graphData.nodes,
      neighbors,
      linksByNode,
      nodeById,
      layoutHash,
    };
    selectedRef.current = selectedIds;
    communityRef.current = activeCommunity;
    refreshView();
  }, [
    graphData,
    neighbors,
    linksByNode,
    nodeById,
    layoutHash,
    selectedIds,
    activeCommunity,
    isDarkTheme,
    refreshView,
  ]);

  useEffect(() => {
    const graph = graphRef.current;
    if (graph) {
      // Link rest length can never sit below the two endpoint radii: the
      // old 3000/mentions distance was far smaller than a hub's own radius,
      // so the spring pulled neighbors inside the blob and permanently
      // fought the collision force
      graph
        .d3Force('link')
        // biome-ignore lint/suspicious/noExplicitAny: idc
        ?.distance((link: any) =>
          Math.max(
            3000 / (link.source.mentions || 1),
            link.source.radius + link.target.radius + 40,
          ),
        );
      // TODO: Add influence type for the link distance and strength
      // Each endpoint pulls proportionally to its influence count: heavily
      // mentioned mappers drag their connections toward themselves, while
      // mappers under ~4 mentions contribute next to nothing so leaf nodes
      // cannot tug the layout
      const endpointPull = (mentions: number) =>
        Math.max(Math.min((mentions - 3) / 200, 0.45), 0.002);
      graph.d3Force('link')?.strength(
        // biome-ignore lint/suspicious/noExplicitAny: idc
        (node: any) =>
          endpointPull(node.source.mentions) +
          endpointPull(node.target.mentions),
      );

      // Curved repulsion: full push at close range decaying with distance,
      // and a hard cutoff so far-apart nodes stop shoving each other toward
      // the edges of the canvas. distanceMin tames the near-singularity
      // (hard overlaps are collide's job).
      const charge = graph.d3Force('charge');
      // biome-ignore lint/suspicious/noExplicitAny: idc
      charge?.strength((node: any) => -(node.mentions ** 2 * 100) - 100);
      // biome-ignore lint/suspicious/noExplicitAny: idc
      (charge as any)?.distanceMin(10);
      // biome-ignore lint/suspicious/noExplicitAny: idc
      (charge as any)?.distanceMax(2400);

      // Collision sphere derives from the drawn radius (the old
      // mentions^1.2 formula fell below the visual radius for mid-size
      // nodes, letting blobs overlap) plus a margin that grows with size,
      // so large blobs clear more space around themselves. Two iterations
      // resolve stacked overlaps more firmly per tick.
      graph.d3Force(
        'collide',
        forceCollide().radius(collideRadius).strength(1).iterations(3),
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

  const handleEngineStop = useCallback(() => {
    const { nodes, layoutHash: hash } = dataRef.current;
    if (nodes.length === 0) return;
    resolveResidualOverlaps(nodes);
    // Positions may have shifted after the engine stopped — force one
    // repaint so the cleanup is visible
    const graph = graphRef.current;
    if (graph) {
      try {
        const center = graph.centerAt();
        graph.centerAt(center.x, center.y);
      } catch {}
    }
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

  // Base link styling never reacts to hover/selection — the overlay handles
  // focus — so pan/zoom while hovering costs the same as normal panning
  const linkVisibility = useCallback((link: GraphLink) => {
    const { activeCommunity: community } = viewRef.current;
    if (community === null) return true;
    return (
      typeof link.source === 'object' &&
      typeof link.target === 'object' &&
      link.source.community === community &&
      link.target.community === community
    );
  }, []);

  const linkColor = useCallback((link: GraphLink) => {
    const { activeCommunity: community } = viewRef.current;
    const source = typeof link.source === 'object' ? link.source : undefined;
    if (community !== null) return source?.colorSemi ?? '#999';
    return source?.colorFaded ?? 'rgba(128, 128, 128, 0.1)';
  }, []);

  const getLabelSprite = useCallback((node: GraphNode) => {
    const cache = labelSprites.current;
    const id = node.id as number;
    let sprite = cache.get(id);
    if (sprite === undefined) {
      sprite = buildLabelSprite(node.username, themeRef.current);
      cache.set(id, sprite);
    }
    return sprite;
  }, []);

  const drawLabel = useCallback(
    (
      node: GraphNode,
      sprite: HTMLCanvasElement,
      ctx: CanvasRenderingContext2D,
      globalScale: number,
    ) => {
      const fontSize = Math.max(12 / globalScale, node.radius * 0.3);
      const scale = fontSize / LABEL_SPRITE_FONT_PX;
      ctx.drawImage(
        sprite,
        (node.x as number) - (sprite.width * scale) / 2,
        (node.y as number) +
          node.radius +
          fontSize * 0.3 -
          LABEL_SPRITE_FONT_PX * 0.15 * scale,
        sprite.width * scale,
        sprite.height * scale,
      );
    },
    [],
  );

  // Hover/selection highlight, drawn on top of the untouched base render:
  // one translucent wash dims everything at O(1), then only the focused
  // neighborhood is redrawn. Hover cost scales with the neighborhood, never
  // with the whole graph.
  const paintFocusOverlay = useCallback(
    (ctx: CanvasRenderingContext2D, globalScale: number) => {
      const { focusIds } = viewRef.current;
      if (focusIds.size === 0) return;
      const { neighbors: neighborMap, linksByNode: linkIndex, nodeById: nodeIndex } =
        dataRef.current;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = dimWashRef.current;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();

      const focusList = Array.from(focusIds);

      // Links of every focused node; outbound (focused node is the target's
      // declarer) drawn dotted, inbound solid
      OVERLAY_DASH[0] = 4 / globalScale;
      OVERLAY_DASH[1] = 3 / globalScale;
      // Mutual pairs exist as two link objects over the same segment, so
      // dedupe by unordered pair to draw each connection once
      const drawnPairs = new Set<string>();
      for (const id of focusList) {
        const links = linkIndex.get(id);
        if (!links) continue;
        for (const link of links) {
          const source = link.source;
          const target = link.target;
          if (typeof source !== 'object' || typeof target !== 'object')
            continue;
          if (
            source.x === undefined ||
            source.y === undefined ||
            target.x === undefined ||
            target.y === undefined
          )
            continue;
          const sourceId = source.id as number;
          const targetId = target.id as number;
          const pairKey =
            sourceId < targetId
              ? `${sourceId}>${targetId}`
              : `${targetId}>${sourceId}`;
          if (drawnPairs.has(pairKey)) continue;
          drawnPairs.add(pairKey);
          if (link.mutual) {
            // Both mappers list each other: thick solid line
            ctx.setLineDash(EMPTY_DASH);
            ctx.lineWidth = 4 / globalScale;
          } else {
            const outbound = focusIds.has(targetId);
            ctx.setLineDash(outbound ? OVERLAY_DASH : EMPTY_DASH);
            ctx.lineWidth = 2 / globalScale;
          }
          ctx.strokeStyle = source.color ?? '#999';
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      }
      ctx.setLineDash(EMPTY_DASH);
      ctx.lineWidth = 2 / globalScale;

      // Neighborhood nodes at full brightness on top of the wash
      const visibleIds = new Set<number>(focusList);
      for (const id of focusList) {
        const linked = neighborMap.get(id);
        if (linked)
          for (const neighborId of Array.from(linked))
            visibleIds.add(neighborId);
      }
      const labelNeighbors = visibleIds.size <= NEIGHBOR_LABEL_LIMIT;
      let spriteBudget = SPRITE_BUDGET_PER_FRAME;
      const cache = labelSprites.current;

      for (const id of Array.from(visibleIds)) {
        const node = nodeIndex.get(id);
        if (!node || node.x === undefined || node.y === undefined) continue;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fill();

        const focused = focusIds.has(id);
        if (focused) {
          ctx.lineWidth = Math.max(2 / globalScale, node.radius * 0.1);
          ctx.strokeStyle = themeRef.current ? '#ffffff' : '#1a1a1a';
          ctx.stroke();
          ctx.lineWidth = 2 / globalScale;
        }

        const screenRadius = node.radius * globalScale;
        if (focused || (labelNeighbors && screenRadius > 4)) {
          let sprite = cache.get(id);
          if (sprite === undefined) {
            // Unbuilt sprite: rasterize within budget, otherwise leave it
            // for a later frame instead of bursting on first hover
            if (spriteBudget > 0) {
              spriteBudget--;
              sprite = buildLabelSprite(node.username, themeRef.current);
              cache.set(id, sprite);
            } else sprite = null;
          }
          if (sprite) drawLabel(node, sprite, ctx, globalScale);
        }
      }
    },
    [drawLabel],
  );

  // Base node painting is independent of hover/selection (overlay handles
  // those); only the community filter dims here
  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      if (node.x === undefined || node.y === undefined) return;
      const { highlightSet } = viewRef.current;
      const dimmed = highlightSet !== null && !highlightSet.has(node.id);
      const screenRadius = node.radius * globalScale;

      // Dimmed nodes below a few pixels are invisible at 0.08 alpha; skipping
      // them keeps community-filtered repaints cheap
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

      if (!dimmed && screenRadius > 12) {
        const sprite = getLabelSprite(node);
        if (sprite) drawLabel(node, sprite, ctx, globalScale);
      }
      ctx.globalAlpha = 1;
    },
    [getLabelSprite, drawLabel],
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
        <span className={`${styles.legendTitle} ${styles.linkTitle}`}>
          Connections
        </span>
        <div className={styles.linkType}>
          <svg viewBox="0 0 40 6" aria-hidden="true">
            <line
              x1="0"
              y1="3"
              x2="40"
              y2="3"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
          </svg>
          Mappers they influenced
        </div>
        <div className={styles.linkType}>
          <svg viewBox="0 0 40 6" aria-hidden="true">
            <line
              x1="0"
              y1="3"
              x2="40"
              y2="3"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          Influences they added
        </div>
        <div className={styles.linkType}>
          <svg viewBox="0 0 40 6" aria-hidden="true">
            <line
              x1="0"
              y1="3"
              x2="40"
              y2="3"
              stroke="currentColor"
              strokeWidth="4"
            />
          </svg>
          Mutual influence
        </div>
        <span className={styles.legendHint}>
          Auto-detected clusters, named after their most mentioned mapper.
          Links take the color of the mapper who declared the influence.
          Connection styles show when a mapper is hovered or selected.
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
        linkWidth={0.2}
        linkPointerAreaPaint={skipLinkPointerPaint}
        onRenderFramePost={paintFocusOverlay}
        maxZoom={10}
        enableNodeDrag={false}
        warmupTicks={layoutFromCache ? 0 : 5}
        cooldownTicks={layoutFromCache ? 0 : 300}
        autoPauseRedraw
        onEngineStop={handleEngineStop}
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
