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

import PresetEditor from './PresetEditor';
import {
  CUSTOM_PRESET_NAME,
  DEFAULT_PRESET,
  FORCE_PRESETS,
  type ForcePreset,
} from './presets';
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

// Bump the version whenever force semantics change so stale layouts computed
// under old physics are discarded; the preset name is appended per entry so
// each lab preset caches its own settled layout
const LAYOUT_CACHE_KEY = 'mapper-influences:graph-layout:v65';

// Single source of truth for the collision sphere, shared by the live force
// and the post-settle cleanup pass
const makeCollideRadius = (collision: ForcePreset['collision']) =>
  // biome-ignore lint/suspicious/noExplicitAny: d3 node
  (node: any) => node.radius * collision.radiusScale + collision.radiusPad;

// Terminal velocity, scaled with alpha: generous while the sim is hot so
// clusters can form and travel, tightening as it cools so late kicks cannot
// fling light nodes. Registered last to cap the net velocity of all forces.
const createSpeedLimit = (config: ForcePreset['speedCap']) => {
  let nodes: GraphNode[] = [];
  // Per-node scale: influential mappers are anchors and should barely move,
  // light mappers travel freely
  let capScales: number[] = [];
  const force = (alpha: number) => {
    const maxSpeed = config.base + config.earlyBoost * alpha;
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      const nodeMax = maxSpeed * capScales[index];
      const vx = node.vx ?? 0;
      const vy = node.vy ?? 0;
      const speed = Math.hypot(vx, vy);
      if (speed > nodeMax) {
        node.vx = (vx / speed) * nodeMax;
        node.vy = (vy / speed) * nodeMax;
      }
    }
  };
  force.initialize = (simNodes: GraphNode[]) => {
    nodes = simNodes;
    capScales = simNodes.map(
      (node) =>
        config.maxScale -
        config.influenceScale * Math.min(node.mentions / 100, 1),
    );
  };
  return force;
};

// Emulated mass: d3 forces inject velocity blind to node size, so the same
// push displaces a giant as far as a leaf. Scaling each node's velocity by
// an inverse-mass factor every tick (after all forces) makes influential
// mappers heavy — mutual interactions move the light party, and the biggest
// cluster becomes the reference frame others arrange around.
const createInertia = (config: ForcePreset['inertia']) => {
  let nodes: GraphNode[] = [];
  // Mass grows as the simulation cools: giants stay mobile during the hot
  // sorting phase, then progressively freeze into anchors so nothing
  // displaces the settled core
  let earlyKeeps: number[] = [];
  let lateKeeps: number[] = [];
  const force = (alpha: number) => {
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      const keep =
        earlyKeeps[index] * alpha + lateKeeps[index] * (1 - alpha);
      node.vx = (node.vx ?? 0) * keep;
      node.vy = (node.vy ?? 0) * keep;
    }
  };
  force.initialize = (simNodes: GraphNode[]) => {
    nodes = simNodes;
    const influences = simNodes.map((node) =>
      Math.min(node.mentions / 100, 1),
    );
    earlyKeeps = influences.map(
      (influence) => 1 - config.earlyLoss * influence,
    );
    lateKeeps = influences.map((influence) => 1 - config.lateLoss * influence);
  };
  return force;
};

// Pairwise repulsion between influential mappers of different communities:
// hubs from unrelated scenes often get glued together by small mappers who
// list both, and regular charge cannot tell them apart. Only hub pairs are
// checked (k² over a small k), only across communities, and only in range.
const createHubSeparation = (
  minMentions: number,
  crossRange: number,
  crossStrength: number,
  sameRange: number,
  sameStrength: number,
) => {
  let hubs: GraphNode[] = [];
  const force = (alpha: number) => {
    for (let a = 0; a < hubs.length; a++) {
      for (let b = a + 1; b < hubs.length; b++) {
        const nodeA = hubs[a];
        const nodeB = hubs[b];
        const sameCommunity = nodeA.community === nodeB.community;
        const range = sameCommunity ? sameRange : crossRange;
        const strength = sameCommunity ? sameStrength : crossStrength;
        const deltaX = (nodeB.x ?? 0) - (nodeA.x ?? 0);
        const deltaY = (nodeB.y ?? 0) - (nodeA.y ?? 0);
        const distance = Math.hypot(deltaX, deltaY) || 1;
        if (distance >= range) continue;
        const push = (1 - distance / range) * strength * alpha;
        const unitX = deltaX / distance;
        const unitY = deltaY / distance;
        nodeA.vx = (nodeA.vx ?? 0) - unitX * push;
        nodeA.vy = (nodeA.vy ?? 0) - unitY * push;
        nodeB.vx = (nodeB.vx ?? 0) + unitX * push;
        nodeB.vy = (nodeB.vy ?? 0) + unitY * push;
      }
    }
  };
  force.initialize = (simNodes: GraphNode[]) => {
    hubs = simNodes.filter((node) => node.mentions >= minMentions);
  };
  return force;
};

// Nothing in the force stack pins the global centroid (the uniform center
// force was removed for weighted gravity), so the settled layout can sit
// arbitrarily off-origin. Translating the mentions-weighted centroid back
// to the origin is distortion-free and keeps the view centered.
const recenterLayout = (nodes: GraphNode[]) => {
  let weightedX = 0;
  let weightedY = 0;
  let totalWeight = 0;
  for (const node of nodes) {
    const weight = node.mentions + 1;
    weightedX += (node.x ?? 0) * weight;
    weightedY += (node.y ?? 0) * weight;
    totalWeight += weight;
  }
  if (totalWeight === 0) return;
  const centerX = weightedX / totalWeight;
  const centerY = weightedY / totalWeight;
  for (const node of nodes) {
    node.x = (node.x ?? 0) - centerX;
    node.y = (node.y ?? 0) - centerY;
  }
};

// Strays flung out by early high-energy ticks whose springs are too weak to
// reel them back get clamped onto the layout's outer rim (95th-percentile
// radius with slack). The collision pass afterwards separates any overlap
// this introduces.
const clampOutliers = (
  nodes: GraphNode[],
  cleanup: ForcePreset['cleanup'],
) => {
  if (nodes.length < 20) return;
  const distances = nodes.map((node) =>
    Math.hypot(node.x ?? 0, node.y ?? 0),
  );
  const sorted = [...distances].sort((a, b) => a - b);
  const limit =
    sorted[Math.floor(sorted.length * cleanup.outlierPercentile)] *
    cleanup.outlierSlack;
  if (limit <= 0) return;
  nodes.forEach((node, index) => {
    const distance = distances[index];
    if (distance > limit) {
      const scale = limit / distance;
      node.x = (node.x ?? 0) * scale;
      node.y = (node.y ?? 0) * scale;
    }
  });
};

// The simulation can end with a handful of unresolved contacts (dense
// clusters, alpha running out). This runs pure collision passes on the
// settled positions until nothing moves, guaranteeing separation before the
// layout is drawn and cached.
const resolveResidualOverlaps = (
  nodes: GraphNode[],
  collision: ForcePreset['collision'],
  cleanup: ForcePreset['cleanup'],
) => {
  const resolver = forceCollide()
    .radius(makeCollideRadius(collision))
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
  for (let pass = 0; pass < cleanup.maxPasses; pass++) {
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
    if (moved < cleanup.settleThreshold) break;
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

// Floored like visualRadius so 0-mention nodes keep a nonzero size
const nodeVal = (node: GraphNode) => Math.max(node.mentions, 1) ** 1.7;
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

const loadCachedLayout = (
  cacheKey: string,
  hash: number,
): Map<number, [number, number]> | null => {
  try {
    const raw = localStorage.getItem(cacheKey);
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

  // Tracked in state: the canvas size props only re-evaluate on render, so
  // without this a window resize leaves the canvas at its mount-time size
  // (gap below the graph, content stuck in a shrunken strip after
  // shrink-then-enlarge)
  const [viewport, setViewport] = useState(() =>
    typeof window === 'undefined'
      ? { width: 0, height: 0 }
      : { width: window.innerWidth, height: window.innerHeight },
  );
  useEffect(() => {
    const onResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Node filters, applied before community detection and seeding so the
  // layout is computed for exactly the visible subgraph (works with every
  // force preset). minMentions commits on blur/enter, not per keystroke —
  // each change re-runs the simulation.
  const [rankedOnly, setRankedOnly] = useState(false);
  const [minMentions, setMinMentions] = useState(0);
  const [minMentionsDraft, setMinMentionsDraft] = useState('0');
  const commitMinMentions = useCallback(() => {
    setMinMentionsDraft((draft) => {
      const parsed = Math.max(0, Math.floor(Number(draft)) || 0);
      setMinMentions(parsed);
      return String(parsed);
    });
  }, []);

  const [presetName, setPresetName] = useState(DEFAULT_PRESET.name);
  // Custom physics from the editor panel: the built preset, a run counter
  // (each start remounts the graph even when values repeat), and whether
  // the editor currently replaces the preset list
  const [customPreset, setCustomPreset] = useState<ForcePreset | null>(null);
  const [customRun, setCustomRun] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const preset =
    (presetName === CUSTOM_PRESET_NAME
      ? customPreset
      : FORCE_PRESETS.find((candidate) => candidate.name === presetName)) ??
    DEFAULT_PRESET;
  // Each named preset settles into its own cached layout, so switching back
  // to an already-explored preset restores instantly instead of
  // re-simulating. Custom runs bypass the cache entirely: their values can
  // change without the data hash noticing.
  const cacheEnabled = preset.name !== CUSTOM_PRESET_NAME;
  const layoutCacheKey = `${LAYOUT_CACHE_KEY}:${preset.name}`;

  const isDarkTheme = useGlobalTheme((state) => state.theme) !== 'light';

  // Applied before the canvas mounts so it sizes itself at the capped ratio
  const [restoreDevicePixelRatio] = useState(() => capDevicePixelRatio());
  useEffect(() => restoreDevicePixelRatio, [restoreDevicePixelRatio]);

  // Filtered view of the API data; links to hidden nodes drop with them
  const filteredData = useMemo(() => {
    if (!data) return undefined;
    if (!rankedOnly && minMentions <= 0) return data;
    const visible = new Set(
      data.nodes
        .filter(
          (node) =>
            (!rankedOnly || node.ranked_mapper) &&
            node.mentions >= minMentions,
        )
        .map((node) => node.id),
    );
    return {
      nodes: data.nodes.filter((node) => visible.has(node.id)),
      links: data.links.filter(
        (link) => visible.has(link.source) && visible.has(link.target),
      ),
    };
  }, [data, rankedOnly, minMentions]);

  // Copies nodes/links because ForceGraph mutates them (layout coordinates,
  // link endpoint object references)
  const { graphData, layoutHash, layoutFromCache } = useMemo(() => {
    const data = filteredData;
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
    const cachedPositions = cacheEnabled
      ? loadCachedLayout(layoutCacheKey, hash)
      : null;

    // Deterministic two-pass seeding (nodes are sorted by mentions desc):
    // notable mappers go on a phyllotaxis spiral by rank — biggest in the
    // middle, smaller outward. Tiny mappers seed next to their most
    // mentioned already-seeded neighbor instead: their link springs are too
    // weak to drag them across the graph, so they must start where they
    // belong or they strand on the wrong side.
    // Floored at the 1-mention size: 0-mention nodes (mappers who only
    // declared influences) would otherwise render at radius 0 — invisible
    // and unhoverable
    const visualRadius = (mentions: number) =>
      Math.sqrt(Math.max(mentions, 1) ** 1.7) * NODE_REL_SIZE;
    const mentionsById = new Map<number, number>();
    for (const node of data.nodes) mentionsById.set(node.id, node.mentions);
    const adjacency = new Map<number, number[]>();
    for (const link of data.links) {
      if (!adjacency.has(link.source)) adjacency.set(link.source, []);
      if (!adjacency.has(link.target)) adjacency.set(link.target, []);
      adjacency.get(link.source)?.push(link.target);
      adjacency.get(link.target)?.push(link.source);
    }

    const {
      spiralMinMentions,
      communitySpacing,
      memberSpacing,
      anchorRingMargin,
    } = preset.seeding;
    const GOLDEN_ANGLE = 2.399963229728653;
    const seeded = new Map<number, [number, number]>();
    if (!cachedPositions) {
      // Communities claim spiral slots by aggregate influence (biggest in
      // the middle), members sub-spiral around their community's centroid —
      // related clusters spawn adjacent instead of wherever raw rank lands
      const communityWeight = new Map<number, number>();
      for (const node of data.nodes) {
        if (node.mentions < spiralMinMentions) continue;
        const community = labels.get(node.id) as number;
        communityWeight.set(
          community,
          (communityWeight.get(community) ?? 0) + node.mentions,
        );
      }
      const communitySlot = new Map<number, number>();
      Array.from(communityWeight.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([community], index) => communitySlot.set(community, index));

      const memberCount = new Map<number, number>();
      for (const node of data.nodes) {
        let anchor: [number, number] | undefined;
        let anchorMentions = 0;
        if (node.mentions < spiralMinMentions) {
          for (const neighborId of adjacency.get(node.id) ?? []) {
            const neighborMentions = mentionsById.get(neighborId) ?? 0;
            const position = seeded.get(neighborId);
            if (position && neighborMentions > anchorMentions) {
              anchorMentions = neighborMentions;
              anchor = position;
            }
          }
        }
        if (anchor) {
          // Deterministic offset ring around the anchor, outside both bodies
          const offsetAngle = (node.id % 997) * 0.006302;
          const offsetDistance =
            visualRadius(anchorMentions) +
            visualRadius(node.mentions) +
            anchorRingMargin;
          seeded.set(node.id, [
            anchor[0] + Math.cos(offsetAngle) * offsetDistance,
            anchor[1] + Math.sin(offsetAngle) * offsetDistance,
          ]);
        } else {
          const community = labels.get(node.id) as number;
          const slot = communitySlot.get(community) ?? communitySlot.size;
          const communityAngle = slot * GOLDEN_ANGLE;
          const communityRadius = communitySpacing * Math.sqrt(slot);
          const member = memberCount.get(community) ?? 0;
          memberCount.set(community, member + 1);
          const memberAngle = member * GOLDEN_ANGLE;
          const memberRadius = memberSpacing * Math.sqrt(member);
          seeded.set(node.id, [
            Math.cos(communityAngle) * communityRadius +
              Math.cos(memberAngle) * memberRadius,
            Math.sin(communityAngle) * communityRadius +
              Math.sin(memberAngle) * memberRadius,
          ]);
        }
      }
    }

    const nodes = data.nodes.map<GraphNode>((node) => {
      const community = labels.get(node.id) as number;
      const color = colorByCommunity.get(community) ?? '#999';
      const position = cachedPositions?.get(node.id) ??
        seeded.get(node.id) ?? [0, 0];
      return {
        ...node,
        community,
        color,
        colorFaded: `${color}30`,
        colorSemi: `${color}80`,
        radius: visualRadius(node.mentions),
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
  }, [filteredData, isDarkTheme, preset, layoutCacheKey, cacheEnabled]);

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
    links: graphData.links,
    neighbors,
    linksByNode,
    nodeById,
    layoutHash,
    layoutCacheKey,
    cacheEnabled,
  });
  // Engine callbacks (tick ramp, settle cleanup) read the active preset
  // through a ref so their identities stay stable across preset switches
  const presetRef = useRef(preset);
  const labelSprites = useRef(new Map<number, HTMLCanvasElement | null>());
  const themeRef = useRef(true);
  const tickRef = useRef(0);
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
    if (dataRef.current.nodes !== graphData.nodes) tickRef.current = 0;
    themeRef.current = isDarkTheme;
    dataRef.current = {
      nodes: graphData.nodes,
      links: graphData.links,
      neighbors,
      linksByNode,
      nodeById,
      layoutHash,
      layoutCacheKey,
      cacheEnabled,
    };
    presetRef.current = preset;
    selectedRef.current = selectedIds;
    communityRef.current = activeCommunity;
    refreshView();
  }, [
    graphData,
    neighbors,
    linksByNode,
    nodeById,
    layoutHash,
    layoutCacheKey,
    cacheEnabled,
    preset,
    selectedIds,
    activeCommunity,
    isDarkTheme,
    refreshView,
  ]);

  // Re-applies the full force stack on every graph rebuild (preset, filter,
  // custom run, data load). Tied to graphData rather than the preset alone:
  // the library re-initializes its force registry when the node set
  // changes, and a rebuild without a force re-apply used to leave the
  // simulation running stock d3 physics (default charge and rest lengths,
  // uniform centering, no collision) — the "everything clumps in the
  // middle" failure.
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph || graphData.nodes.length === 0) return;
    // Fresh ramp for the new simulation run
    tickRef.current = 0;
    const { springs, charge: chargeConfig, collision, gravity } = preset;

    // Link rest length can never sit below the two endpoint radii: anything
    // smaller pulls neighbors inside the blob and permanently fights the
    // collision force
    graph
      .d3Force('link')
      // biome-ignore lint/suspicious/noExplicitAny: idc
      ?.distance((link: any) =>
        Math.max(
          springs.distanceNumerator / (link.source.mentions || 1),
          link.source.radius + link.target.radius + springs.distanceMargin,
        ),
      );
    // TODO: Add influence type for the link distance and strength
    // Each endpoint pulls proportionally to its influence count: heavily
    // mentioned mappers drag their connections toward themselves, while
    // barely mentioned mappers contribute next to nothing so leaf nodes
    // cannot tug the layout
    const endpointPull = (mentions: number) =>
      Math.max(
        Math.min(
          (mentions - springs.pullOffset) / springs.pullDivisor,
          springs.pullMax,
        ),
        springs.pullMin,
      );
    // Cross-community links get a fraction of the spring: a small mapper
    // listing two unrelated hubs should not glue their scenes together.
    // Influences declared BY a giant are the exception — those pull hard
    // and mostly bypass the cross-community damp, so scenes a giant
    // explicitly relates to get dragged toward its cluster. Capped to keep
    // the spring solver stable.
    graph.d3Force('link')?.strength(
      // biome-ignore lint/suspicious/noExplicitAny: idc
      (link: any) => {
        const declarerInfluence = Math.min(link.source.mentions / 100, 1);
        // Declarer-dominated for links touching a giant: a crowd of small
        // declarers holds its giant loosely, so fan springs cannot add up
        // to drag related giants apart. Between two small/mid mappers the
        // spring stays symmetric — small clusters need their full internal
        // bonds or they scatter.
        const bothSmall =
          link.source.mentions < springs.bothSmallThreshold &&
          link.target.mentions < springs.bothSmallThreshold;
        const base = bothSmall
          ? endpointPull(link.source.mentions) +
            endpointPull(link.target.mentions)
          : endpointPull(link.source.mentions) * springs.declarerFactor +
            endpointPull(link.target.mentions) * springs.receiverFactor;
        const declarerBoost =
          1 + declarerInfluence * springs.declarerBoostScale;
        const communityFactor =
          link.source.community === link.target.community
            ? 1
            : springs.crossCommunityBase +
              springs.crossCommunityDeclarerScale * declarerInfluence;
        return (
          Math.min(
            base * declarerBoost * communityFactor,
            springs.strengthCap,
          ) * (bothSmall ? springs.bothSmallScale : springs.mixedScale)
        );
      },
    );

    // Curved repulsion: full push at close range decaying with distance,
    // and a hard cutoff so far-apart nodes stop shoving each other toward
    // the edges of the canvas. distanceMin tames the near-singularity
    // (hard overlaps are collide's job). The giant term starts at the ramp
    // floor and grows over time (see onEngineTick) so small nodes can cross
    // the middle early instead of bouncing off the giant field.
    const charge = graph.d3Force('charge');
    charge?.strength(
      // biome-ignore lint/suspicious/noExplicitAny: idc
      (node: any) =>
        -(
          node.mentions ** chargeConfig.exponent *
          chargeConfig.scale *
          chargeConfig.rampFloor
        ) - chargeConfig.base,
    );
    // biome-ignore lint/suspicious/noExplicitAny: idc
    (charge as any)?.distanceMin(chargeConfig.distanceMin);
    // biome-ignore lint/suspicious/noExplicitAny: idc
    (charge as any)?.distanceMax(chargeConfig.distanceMax);

    // Collision sphere derives from the drawn radius plus a margin that
    // grows with size, so large blobs clear more space around themselves.
    // Collision stays off while the simulation is hot (alpha above the
    // gate) so nodes can pass through each other and reach their cluster;
    // it engages once the layout has roughly sorted itself. The post-settle
    // cleanup still guarantees final separation.
    const collide = forceCollide()
      .radius(makeCollideRadius(collision))
      .strength(collision.strength)
      .iterations(collision.iterations);
    if (collision.alphaGate >= 1) {
      graph.d3Force('collide', collide);
    } else {
      // biome-ignore lint/suspicious/noExplicitAny: custom d3 force wrapper
      const gatedCollide: any = (alpha: number) => {
        if (alpha <= collision.alphaGate) collide(alpha);
      };
      // biome-ignore lint/suspicious/noExplicitAny: d3 initialize passthrough
      gatedCollide.initialize = (...args: any[]) =>
        // biome-ignore lint/suspicious/noExplicitAny: d3 initialize passthrough
        (collide as any).initialize(...args);
      graph.d3Force('collide', gatedCollide);
    }

    // Weight-based gravity replaces the uniform centering force: heavily
    // mentioned mappers are pulled to the middle, small nodes barely at
    // all, so repulsion pushes them to the rim instead of letting them
    // pool in the center.
    // Floor kept low on purpose: raising it compresses everything into one
    // uniformly packed disc (gravity vs collision equilibrium) and cluster
    // structure smears out. Far-flung strays are handled after settle by
    // the outlier clamp instead.
    // biome-ignore lint/suspicious/noExplicitAny: idc
    const centerPull = (node: any) => {
      const influence = Math.min(node.mentions / 100, 1);
      return influence ** gravity.exponent * gravity.scale + gravity.floor;
    };
    graph.d3Force('center', null);
    graph.d3Force('x', forceX(0).strength(centerPull));
    graph.d3Force('y', forceY(0).strength(centerPull));

    // Extra recall that grows with distance: the linear link spring is too
    // weak on light nodes once they drift far, so links stretched beyond
    // the start threshold get an additional pull that ramps with the
    // excess, applied mostly to the lighter endpoint
    if (preset.recall.enabled) {
      const recall = preset.recall;
      // Full recall for leaves, fading with size but keeping a floor so a
      // large mapper stranded far from its connections still walks back
      const recallWeight = (mentions: number) =>
        Math.max(1 - mentions / recall.weightDivisor, recall.weightFloor);
      const longRangeRecall = (alpha: number) => {
        for (const link of dataRef.current.links) {
          const source = link.source;
          const target = link.target;
          if (typeof source !== 'object' || typeof target !== 'object')
            continue;
          const deltaX = (target.x ?? 0) - (source.x ?? 0);
          const deltaY = (target.y ?? 0) - (source.y ?? 0);
          const distance = Math.hypot(deltaX, deltaY);
          if (distance < recall.start) continue;
          // Unit-vector pull with a capped superlinear ramp: proportional-
          // to-distance versions resonate (overshoot, re-stretch, gain
          // energy) and slingshot nodes off screen. The alpha floor keeps
          // recall working late in the settle, when strays created by the
          // early chaos still need to walk home.
          const pull =
            Math.min(
              (distance - recall.start) / recall.excessDivisor,
              recall.rampCap,
            ) **
              recall.rampExponent *
            recall.scale *
            (recall.alphaFloor + (1 - recall.alphaFloor) * alpha);
          const unitX = deltaX / distance;
          const unitY = deltaY / distance;
          // Each endpoint is recalled by its own lightness: influential
          // mappers are already anchored by center gravity and hundreds of
          // stretched fan links would otherwise stack pull on them, while a
          // stray leaf needs the full force regardless of who it links to
          const sourceWeight = recallWeight(source.mentions);
          const targetWeight = recallWeight(target.mentions);
          source.vx = (source.vx ?? 0) + unitX * pull * sourceWeight;
          source.vy = (source.vy ?? 0) + unitY * pull * sourceWeight;
          target.vx = (target.vx ?? 0) - unitX * pull * targetWeight;
          target.vy = (target.vy ?? 0) - unitY * pull * targetWeight;
        }
      };
      // biome-ignore lint/suspicious/noExplicitAny: custom d3 force
      graph.d3Force('recall', longRangeRecall as any);
    } else {
      // biome-ignore lint/suspicious/noExplicitAny: force removal
      graph.d3Force('recall', null as any);
    }

    // Strengths sized to survive inertia damping on heavy endpoints:
    // cross-community hubs push apart hard at long range, same-community
    // hubs get a shorter gentler push so they spread inside their cluster
    // biome-ignore lint/suspicious/noExplicitAny: custom d3 force / removal
    const hubSeparation: any = preset.hubSeparation.enabled
      ? createHubSeparation(
          preset.hubSeparation.minMentions,
          preset.hubSeparation.crossRange,
          preset.hubSeparation.crossStrength,
          preset.hubSeparation.sameRange,
          preset.hubSeparation.sameStrength,
        )
      : null;
    graph.d3Force('hubSeparation', hubSeparation);

    // biome-ignore lint/suspicious/noExplicitAny: custom d3 force / removal
    const speedLimit: any = preset.speedCap.enabled
      ? createSpeedLimit(preset.speedCap)
      : null;
    graph.d3Force('speedLimit', speedLimit);

    // Last: converts injected velocity into mass-weighted displacement
    // biome-ignore lint/suspicious/noExplicitAny: custom d3 force / removal
    const inertia: any = preset.inertia.enabled
      ? createInertia(preset.inertia)
      : null;
    graph.d3Force('inertia', inertia);
  }, [preset, graphData]);

  // Simulation progress: visibility via state (per rebuild), fill width
  // driven directly through a ref from the tick handler — a React render
  // per tick would repaint the whole page ~60x/s for nothing
  const [simulating, setSimulating] = useState(false);
  const progressFillRef = useRef<HTMLDivElement | null>(null);

  // Start zoomed all the way out whenever the graph is rebuilt (preset or
  // filter switch, data load): the seeded layout spans thousands of units,
  // and the default camera would stare at an empty middle while the
  // simulation sorts itself. The post-settle zoomToFit then reframes.
  useEffect(() => {
    if (graphData.nodes.length === 0) return;
    try {
      graphRef.current?.zoomToFit(0, 80);
    } catch {
      // Canvas not ready yet; the post-settle fit will frame the layout
    }
  }, [graphData]);

  // A rebuild that actually simulates (no cached layout) shows the bar
  useEffect(() => {
    if (progressFillRef.current) progressFillRef.current.style.width = '0%';
    setSimulating(graphData.nodes.length > 0 && !layoutFromCache);
  }, [graphData, layoutFromCache]);

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
    const {
      nodes,
      layoutHash: hash,
      layoutCacheKey: cacheKey,
      cacheEnabled: shouldCache,
    } = dataRef.current;
    const activePreset = presetRef.current;
    if (nodes.length === 0) return;
    setSimulating(false);
    recenterLayout(nodes);
    clampOutliers(nodes, activePreset.cleanup);
    resolveResidualOverlaps(nodes, activePreset.collision, activePreset.cleanup);
    // Fit the settled layout into view: remounts (preset/filter switches)
    // reset the camera to origin at default zoom, which shows only a tiny
    // slice of a layout that spans thousands of units
    const graph = graphRef.current;
    if (graph) {
      try {
        graph.zoomToFit(400, 80);
      } catch {}
    }
    if (!shouldCache) return;
    try {
      const positions = nodes.map<[number, number, number]>((node) => [
        node.id as number,
        Math.round(node.x ?? 0),
        Math.round(node.y ?? 0),
      ]);
      localStorage.setItem(
        cacheKey,
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
            // Both mappers list each other: two parallel lines, each colored
            // by the mapper declaring that direction
            ctx.setLineDash(EMPTY_DASH);
            ctx.lineWidth = 1.5 / globalScale;
            const deltaX = target.x - source.x;
            const deltaY = target.y - source.y;
            const length = Math.hypot(deltaX, deltaY) || 1;
            const offsetX = (-deltaY / length) * (2.5 / globalScale);
            const offsetY = (deltaX / length) * (2.5 / globalScale);
            ctx.strokeStyle = source.color ?? '#999';
            ctx.beginPath();
            ctx.moveTo(source.x + offsetX, source.y + offsetY);
            ctx.lineTo(target.x + offsetX, target.y + offsetY);
            ctx.stroke();
            ctx.strokeStyle = target.color ?? '#999';
            ctx.beginPath();
            ctx.moveTo(source.x - offsetX, source.y - offsetY);
            ctx.lineTo(target.x - offsetX, target.y - offsetY);
            ctx.stroke();
            continue;
          }
          const outbound = focusIds.has(targetId);
          ctx.setLineDash(outbound ? OVERLAY_DASH : EMPTY_DASH);
          ctx.lineWidth = 2 / globalScale;
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

      <aside className={styles.filters}>
        <span className={styles.filterTitle}>Filters</span>
        <label className={styles.filterRow}>
          <input
            type="checkbox"
            checked={rankedOnly}
            onChange={(event) => setRankedOnly(event.target.checked)}
          />
          ranked mappers only
        </label>
        <label className={styles.filterRow}>
          min influences
          <input
            type="number"
            min={0}
            value={minMentionsDraft}
            onChange={(event) => setMinMentionsDraft(event.target.value)}
            onBlur={commitMinMentions}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commitMinMentions();
              }
            }}
          />
        </label>
      </aside>

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

      {editorOpen ? (
        <PresetEditor
          // Remount per active preset so reopening seeds fresh values from
          // whatever is currently running (including the last custom run).
          // Prefixed: ForceGraph below is a sibling keyed on the same
          // preset/run pair, and duplicate sibling keys corrupt React's
          // reconciliation (the closed editor stayed mounted as a ghost).
          key={`editor:${preset.name}:${customRun}`}
          seed={preset}
          onStart={(built) => {
            setCustomPreset(built);
            setPresetName(CUSTOM_PRESET_NAME);
            setCustomRun((run) => run + 1);
          }}
          onClose={() => setEditorOpen(false)}
        />
      ) : (
        <aside className={styles.labPanel}>
          <span className={styles.labTitle}>Layout presets</span>
          {FORCE_PRESETS.map((candidate) => (
            <button
              type="button"
              key={candidate.name}
              className={
                candidate.name === preset.name ? styles.active : undefined
              }
              onClick={() => setPresetName(candidate.name)}
            >
              {candidate.name}
              {candidate.recommended && (
                <span className={styles.recommended}>recommended</span>
              )}
            </button>
          ))}
          {customPreset && (
            <button
              type="button"
              className={
                preset.name === CUSTOM_PRESET_NAME ? styles.active : undefined
              }
              onClick={() => setPresetName(CUSTOM_PRESET_NAME)}
            >
              {CUSTOM_PRESET_NAME}
            </button>
          )}
          <button
            type="button"
            className={styles.customizeButton}
            onClick={() => setEditorOpen(true)}
          >
            customize…
          </button>
          <span className={styles.labIntent}>{preset.intent}</span>
        </aside>
      )}

      {simulating && (
        <output className={styles.simProgress}>
          <span>Simulating layout…</span>
          <div className={styles.track}>
            <div ref={progressFillRef} className={styles.fill} />
          </div>
        </output>
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
              y1="1.5"
              x2="40"
              y2="1.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <line
              x1="0"
              y1="4.5"
              x2="40"
              y2="4.5"
              stroke="currentColor"
              strokeWidth="1.5"
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
        // One stable instance — never keyed/remounted. Preset and filter
        // switches rebuild graphData, which reheats the simulation; the
        // forces effect re-applies the preset physics in the same commit.
        // Remounting instead created a window where the fresh instance ran
        // stock d3 physics before the forces effect fired.
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
        // Warmup always 0: the library runs warmup ticks synchronously
        // while processing new graphData, BEFORE the forces effect has
        // applied the preset physics — stock-physics warmup wrecks the
        // seeded positions. All settling happens in the cooldown instead.
        warmupTicks={0}
        cooldownTicks={layoutFromCache ? 0 : preset.sim.cooldownTicks}
        autoPauseRedraw
        onEngineTick={() => {
          // Giant repulsion ramps in as the sim cools (rampFloor -> 1x):
          // small nodes cross the middle early without bouncing off the
          // giant field, then full separation locks in. Alpha is
          // approximated from the tick count (the library does not expose
          // it). forceManyBody caches strength at init, so the accessor
          // must be re-set every tick for the ramp to take effect.
          tickRef.current++;
          const fill = progressFillRef.current;
          if (fill) {
            const total = presetRef.current.sim.cooldownTicks || 1;
            fill.style.width = `${Math.min(
              (tickRef.current / total) * 100,
              100,
            )}%`;
          }
          const chargeConfig = presetRef.current.charge;
          // rampFloor >= 1 means static charge — skip the per-tick re-set
          if (chargeConfig.rampFloor >= 1) return;
          const rampDecay = chargeConfig.rampDecay ** tickRef.current;
          const ramp =
            chargeConfig.rampFloor +
            (1 - chargeConfig.rampFloor) * (1 - rampDecay);
          const charge = graphRef.current?.d3Force('charge');
          // biome-ignore lint/suspicious/noExplicitAny: idc
          (charge as any)?.strength(
            // biome-ignore lint/suspicious/noExplicitAny: idc
            (node: any) =>
              -(node.mentions ** chargeConfig.exponent *
                chargeConfig.scale *
                ramp) - chargeConfig.base,
          );
        }}
        onEngineStop={handleEngineStop}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onBackgroundClick={handleBackgroundClick}
        ref={graphRef}
        // Fill everything below the 3.5rem fixed header; the page's
        // negative margins cancel the layout padding
        width={viewport.width}
        height={viewport.height - 56}
      />
    </div>
  );
};

export default GraphPage;
