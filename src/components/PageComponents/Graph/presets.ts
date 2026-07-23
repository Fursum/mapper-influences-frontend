// Force-configuration presets for the graph layout lab.
//
// Every physics constant that shapes the settled layout lives here as one
// typed object per preset, consumed by the Graph component's seeding pass,
// force stack, tick ramp, and post-settle cleanup. The lab panel (?lab=1)
// switches presets live so layouts can be compared side by side.
//
// Shared vocabulary: "influence" = min(mentions / 100, 1) everywhere.

export type ForcePreset = {
  name: string;
  // One-line philosophy shown in the preset panel
  intent: string;
  // Highlighted in the panel as the suggested default
  recommended?: boolean;
  seeding: {
    // Nodes below this mention count seed beside their biggest neighbor
    // instead of on the community spiral
    spiralMinMentions: number;
    // Distance between community centroids on the outer phyllotaxis spiral
    communitySpacing: number;
    // Distance between members on a community's inner sub-spiral
    memberSpacing: number;
    // Extra gap past both radii when anchoring a tiny node beside its hub
    anchorRingMargin: number;
  };
  gravity: {
    // strength = influence^exponent * scale + floor
    exponent: number;
    scale: number;
    floor: number;
  };
  springs: {
    // endpointPull = clamp((mentions - pullOffset) / pullDivisor, pullMin, pullMax)
    pullOffset: number;
    pullDivisor: number;
    pullMin: number;
    pullMax: number;
    // Below this mention count on both ends the spring stays symmetric
    // (sum of pulls); otherwise declarer-dominated
    bothSmallThreshold: number;
    declarerFactor: number;
    receiverFactor: number;
    // declarerBoost = 1 + declarerInfluence * declarerBoostScale
    declarerBoostScale: number;
    // Cross-community damp: base + declarerScale * declarerInfluence (1 if same)
    crossCommunityBase: number;
    crossCommunityDeclarerScale: number;
    strengthCap: number;
    // Final multiplier, split by the bothSmall branch
    bothSmallScale: number;
    mixedScale: number;
    // rest length = max(distanceNumerator / sourceMentions,
    //                   sourceRadius + targetRadius + distanceMargin)
    // Floored at radii + margin: anything below pulls neighbors inside the
    // blob and fights collision forever
    distanceNumerator: number;
    distanceMargin: number;
  };
  charge: {
    // strength = -(mentions^exponent * scale * ramp) - base
    exponent: number;
    scale: number;
    base: number;
    // ramp = rampFloor + (1 - rampFloor) * (1 - rampDecay^tick);
    // rampFloor >= 1 means static charge (no per-tick re-set)
    rampFloor: number;
    rampDecay: number;
    distanceMin: number;
    distanceMax: number;
  };
  collision: {
    // sphere = radius * radiusScale + radiusPad (shared with cleanup pass)
    radiusScale: number;
    radiusPad: number;
    strength: number;
    iterations: number;
    // Collision engages once alpha falls to this; >= 1 means always on
    alphaGate: number;
  };
  recall: {
    enabled: boolean;
    // Links stretched past this get extra unit-vector pull (capped ramp —
    // distance-proportional recall resonates and slingshots)
    start: number;
    excessDivisor: number;
    rampCap: number;
    rampExponent: number;
    scale: number;
    // pull *= alphaFloor + (1 - alphaFloor) * alpha
    alphaFloor: number;
    // per-endpoint weight = max(1 - mentions / weightDivisor, weightFloor)
    weightDivisor: number;
    weightFloor: number;
  };
  hubSeparation: {
    enabled: boolean;
    minMentions: number;
    crossRange: number;
    crossStrength: number;
    sameRange: number;
    sameStrength: number;
  };
  inertia: {
    enabled: boolean;
    // keep = (1 - earlyLoss*influence)*alpha + (1 - lateLoss*influence)*(1-alpha)
    earlyLoss: number;
    lateLoss: number;
  };
  speedCap: {
    enabled: boolean;
    // maxSpeed = (base + earlyBoost * alpha) * (maxScale - influenceScale * influence)
    base: number;
    earlyBoost: number;
    maxScale: number;
    influenceScale: number;
  };
  sim: {
    warmupTicks: number;
    cooldownTicks: number;
  };
  cleanup: {
    // Clamp nodes past percentile radius * slack back onto the rim
    outlierPercentile: number;
    outlierSlack: number;
    // Pure-collision relaxation after settle
    maxPasses: number;
    settleThreshold: number;
  };
};

const baseline: ForcePreset = {
  name: 'baseline',
  intent: 'Current tuning: staged settle, mass inertia, ramped giant charge.',
  seeding: {
    spiralMinMentions: 10,
    communitySpacing: 6000,
    memberSpacing: 800,
    anchorRingMargin: 80,
  },
  gravity: { exponent: 2, scale: 0.08, floor: 0.001 },
  springs: {
    pullOffset: 3,
    pullDivisor: 140,
    pullMin: 0.002,
    pullMax: 0.6,
    bothSmallThreshold: 40,
    declarerFactor: 1.7,
    receiverFactor: 0.05,
    declarerBoostScale: 1.5,
    crossCommunityBase: 0.3,
    crossCommunityDeclarerScale: 0.4,
    strengthCap: 1,
    bothSmallScale: 0.6,
    mixedScale: 0.45,
    distanceNumerator: 3000,
    distanceMargin: 40,
  },
  charge: {
    exponent: 2.8,
    scale: 20,
    base: 95,
    rampFloor: 0.15,
    rampDecay: 0.9925,
    distanceMin: 10,
    distanceMax: 3200,
  },
  collision: {
    radiusScale: 1.4,
    radiusPad: 20,
    strength: 1,
    iterations: 3,
    alphaGate: 0.4,
  },
  recall: {
    enabled: true,
    start: 1500,
    excessDivisor: 2000,
    rampCap: 12,
    rampExponent: 2,
    scale: 35,
    alphaFloor: 0.2,
    weightDivisor: 30,
    weightFloor: 0.12,
  },
  hubSeparation: {
    enabled: true,
    minMentions: 40,
    crossRange: 2200,
    crossStrength: 50,
    sameRange: 800,
    sameStrength: 25,
  },
  inertia: { enabled: true, earlyLoss: 0.3, lateLoss: 0.9 },
  speedCap: {
    enabled: true,
    base: 280,
    earlyBoost: 1700,
    maxScale: 1.15,
    influenceScale: 0.95,
  },
  sim: { warmupTicks: 5, cooldownTicks: 300 },
  cleanup: {
    outlierPercentile: 0.9,
    outlierSlack: 1.25,
    maxPasses: 40,
    settleThreshold: 0.5,
  },
};

// Convenience: presets below describe themselves as diffs against baseline
const from = (overrides: {
  name: string;
  intent: string;
  recommended?: boolean;
  seeding?: Partial<ForcePreset['seeding']>;
  gravity?: Partial<ForcePreset['gravity']>;
  springs?: Partial<ForcePreset['springs']>;
  charge?: Partial<ForcePreset['charge']>;
  collision?: Partial<ForcePreset['collision']>;
  recall?: Partial<ForcePreset['recall']>;
  hubSeparation?: Partial<ForcePreset['hubSeparation']>;
  inertia?: Partial<ForcePreset['inertia']>;
  speedCap?: Partial<ForcePreset['speedCap']>;
  sim?: Partial<ForcePreset['sim']>;
  cleanup?: Partial<ForcePreset['cleanup']>;
}): ForcePreset => ({
  name: overrides.name,
  intent: overrides.intent,
  recommended: overrides.recommended,
  seeding: { ...baseline.seeding, ...overrides.seeding },
  gravity: { ...baseline.gravity, ...overrides.gravity },
  springs: { ...baseline.springs, ...overrides.springs },
  charge: { ...baseline.charge, ...overrides.charge },
  collision: { ...baseline.collision, ...overrides.collision },
  recall: { ...baseline.recall, ...overrides.recall },
  hubSeparation: { ...baseline.hubSeparation, ...overrides.hubSeparation },
  inertia: { ...baseline.inertia, ...overrides.inertia },
  speedCap: { ...baseline.speedCap, ...overrides.speedCap },
  sim: { ...baseline.sim, ...overrides.sim },
  cleanup: { ...baseline.cleanup, ...overrides.cleanup },
});

// Recommended default: flat-hierarchy's egalitarian internals on
// archipelago's separated-island geography
const flatIsles = from({
  name: 'flat-isles',
  intent: 'Egalitarian islands: mild size scaling inside well-separated communities.',
  recommended: true,
  // Archipelago's geography: wide seeding gaps, short-range repulsion,
  // weak center pull so islands keep their distance
  seeding: { communitySpacing: 10000, memberSpacing: 700 },
  charge: {
    exponent: 1.8,
    scale: 600,
    rampFloor: 0.3,
    distanceMax: 2000,
  },
  gravity: { exponent: 1, scale: 0.04, floor: 0.001 },
  // Flat-hierarchy's internals: giants dominate their island far less,
  // small mappers keep real spring weight
  springs: {
    declarerFactor: 1.2,
    receiverFactor: 0.3,
    declarerBoostScale: 0.8,
    crossCommunityBase: 0.1,
    crossCommunityDeclarerScale: 0.3,
  },
  inertia: { earlyLoss: 0.2, lateLoss: 0.6 },
  speedCap: { influenceScale: 0.6 },
  hubSeparation: {
    crossRange: 2800,
    crossStrength: 45,
    sameRange: 800,
    sameStrength: 22,
  },
  recall: { start: 2000, scale: 30 },
  cleanup: { outlierPercentile: 0.92, outlierSlack: 1.3 },
});

export const FORCE_PRESETS: ForcePreset[] = [
  flatIsles,
  baseline,

  from({
    name: 'minimal-forces',
    intent: 'Seeding does the work; only springs, mild static charge, collision.',
    charge: {
      exponent: 2,
      scale: 2,
      base: 60,
      rampFloor: 1,
      distanceMax: 2500,
    },
    springs: { mixedScale: 0.35 },
    collision: { alphaGate: 1 },
    recall: { enabled: false },
    hubSeparation: { enabled: false },
    inertia: { enabled: false },
    speedCap: { enabled: false },
  }),

  from({
    name: 'spring-dominant',
    intent: 'Links sculpt the layout; charge only clears local personal space.',
    springs: {
      pullDivisor: 100,
      pullMax: 0.8,
      bothSmallScale: 0.8,
      mixedScale: 0.7,
      distanceNumerator: 2500,
    },
    charge: {
      exponent: 2.2,
      scale: 4,
      base: 40,
      rampFloor: 1,
      distanceMax: 1200,
    },
    hubSeparation: { crossRange: 3000, crossStrength: 70 },
  }),

  from({
    name: 'charge-dominant',
    intent: 'Repulsion field sorts everything; springs just tether strays.',
    charge: {
      exponent: 3,
      scale: 30,
      base: 150,
      rampFloor: 0.1,
      rampDecay: 0.993,
      distanceMax: 5000,
    },
    springs: { pullMax: 0.4, bothSmallScale: 0.3, mixedScale: 0.2 },
    gravity: { scale: 0.15, floor: 0.003 },
    recall: { scale: 50, weightFloor: 0.15 },
    hubSeparation: { enabled: false },
  }),

  from({
    name: 'pure-d3',
    intent: 'Stock link/charge/collide/x/y only — the control group.',
    charge: {
      exponent: 2,
      scale: 8,
      base: 80,
      rampFloor: 1,
      distanceMax: 4000,
    },
    springs: {
      bothSmallThreshold: Number.MAX_SAFE_INTEGER,
      bothSmallScale: 0.5,
      declarerBoostScale: 0,
      crossCommunityBase: 0.5,
      crossCommunityDeclarerScale: 0,
    },
    gravity: { exponent: 1, scale: 0.05, floor: 0.005 },
    collision: { alphaGate: 1 },
    recall: { enabled: false },
    hubSeparation: { enabled: false },
    inertia: { enabled: false },
    speedCap: { enabled: false },
  }),

  from({
    name: 'heavy-anchor',
    intent: 'Extreme mass: giants sort once, then become immovable terrain.',
    inertia: { earlyLoss: 0.5, lateLoss: 0.98 },
    speedCap: { influenceScale: 1.05 },
    gravity: { scale: 0.12 },
    springs: { declarerFactor: 2, receiverFactor: 0.02 },
    recall: { weightFloor: 0.05 },
  }),

  from({
    name: 'flat-hierarchy',
    intent: 'Mild scaling: size matters less, community structure matters more.',
    charge: { exponent: 1.8, scale: 800 },
    gravity: { exponent: 1, scale: 0.05, floor: 0.002 },
    springs: {
      declarerFactor: 1.2,
      receiverFactor: 0.3,
      declarerBoostScale: 0.8,
    },
    inertia: { earlyLoss: 0.2, lateLoss: 0.6 },
    speedCap: { influenceScale: 0.6 },
    hubSeparation: { crossStrength: 35, sameStrength: 20 },
  }),

  from({
    name: 'archipelago',
    intent: 'Islands: huge seeding gaps, short-range forces, local cohesion.',
    seeding: { communitySpacing: 14000, memberSpacing: 700 },
    charge: {
      exponent: 2.6,
      scale: 12,
      rampFloor: 0.3,
      distanceMax: 1800,
    },
    gravity: { scale: 0.03, floor: 0.0005 },
    springs: { crossCommunityBase: 0.1, crossCommunityDeclarerScale: 0.3 },
    hubSeparation: { crossRange: 3500, crossStrength: 60 },
    recall: { start: 2500, scale: 25 },
    cleanup: { outlierPercentile: 0.95, outlierSlack: 1.35 },
  }),

  from({
    name: 'dense-carpet',
    intent: 'Tight weave: small gaps, strong early collision keeps the texture.',
    seeding: { communitySpacing: 2500, memberSpacing: 400 },
    collision: {
      radiusScale: 1.6,
      radiusPad: 30,
      iterations: 4,
      alphaGate: 0.6,
    },
    charge: { exponent: 2.4, scale: 8, base: 60, distanceMax: 1500 },
    gravity: { scale: 0.12, floor: 0.004 },
    springs: { distanceNumerator: 1500, distanceMargin: 20 },
    recall: { start: 1000, scale: 30 },
    hubSeparation: {
      crossRange: 1500,
      crossStrength: 35,
      sameRange: 600,
      sameStrength: 20,
    },
  }),

  from({
    name: 'fast-settle',
    intent: '100 aggressive ticks; the post-settle cleanup does the polish.',
    sim: { warmupTicks: 20, cooldownTicks: 100 },
    charge: { rampFloor: 0.5, rampDecay: 0.97 },
    recall: { alphaFloor: 0.4, scale: 45 },
    speedCap: { base: 350, earlyBoost: 2200 },
    collision: { alphaGate: 0.5 },
    inertia: { lateLoss: 0.85 },
    cleanup: { maxPasses: 60 },
  }),

  from({
    name: 'gravity-well',
    intent: 'Influence is literal gravity: superlinear mass, orbits, wide moats.',
    gravity: { exponent: 3, scale: 0.15, floor: 0.0008 },
    charge: {
      exponent: 3,
      scale: 6,
      base: 120,
      rampFloor: 0.2,
      rampDecay: 0.992,
      distanceMax: 4000,
    },
    springs: {
      declarerFactor: 1.8,
      receiverFactor: 0.03,
      bothSmallScale: 0.7,
      mixedScale: 0.4,
      crossCommunityBase: 0.2,
      crossCommunityDeclarerScale: 0.6,
      distanceNumerator: 2000,
      distanceMargin: 60,
    },
    seeding: { memberSpacing: 900 },
    recall: { start: 1400, scale: 40, weightFloor: 0.1 },
    hubSeparation: {
      minMentions: 50,
      crossRange: 2600,
      crossStrength: 60,
      sameRange: 900,
      sameStrength: 30,
    },
    inertia: { earlyLoss: 0.35, lateLoss: 0.95 },
  }),
];

export const DEFAULT_PRESET = flatIsles;
