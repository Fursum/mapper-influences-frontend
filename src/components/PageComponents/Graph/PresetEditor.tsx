import { type FC, Fragment, useState } from 'react';

import { CUSTOM_PRESET_NAME, type ForcePreset } from './presets';
import styles from './style.module.scss';

// Sections exposed in the editor, in display order; name/intent/recommended
// are metadata, everything else is a flat bag of numbers and enable flags
const SECTION_KEYS = [
  'seeding',
  'gravity',
  'springs',
  'charge',
  'collision',
  'recall',
  'hubSeparation',
  'inertia',
  'speedCap',
  'sim',
  'cleanup',
] as const;
type SectionKey = (typeof SECTION_KEYS)[number];

// Few-word context line shown under each parameter, keyed section.field
const FIELD_HINTS: Record<string, string> = {
  'seeding.spiralMinMentions': 'below this, seed beside biggest neighbor',
  'seeding.communitySpacing': 'gap between community centers',
  'seeding.memberSpacing': 'gap between members of a community',
  'seeding.anchorRingMargin': 'extra gap around anchored tiny nodes',
  'seeding.majorCommunities': 'scenes with own core slot; rest satellite',
  'seeding.detachRatio': 'internal/external links to spawn as far island',
  'gravity.exponent': 'size bias of the center pull',
  'gravity.scale': 'overall pull toward the center',
  'gravity.floor': 'minimum pull for tiny nodes',
  'springs.pullOffset': 'mentions before a node starts pulling',
  'springs.pullDivisor': 'mentions needed for full pull',
  'springs.pullMin': 'weakest endpoint pull',
  'springs.pullMax': 'strongest endpoint pull',
  'springs.bothSmallThreshold': 'below this, springs stay symmetric',
  'springs.declarerFactor': 'declarer-side spring weight',
  'springs.receiverFactor': 'receiver-side spring weight',
  'springs.declarerBoostScale': 'extra pull from influential declarers',
  'springs.crossCommunityBase': 'spring damp across communities',
  'springs.crossCommunityDeclarerScale': 'giant links bypass the damp',
  'springs.strengthCap': 'stability cap for the spring solver',
  'springs.bothSmallScale': 'final strength, small pairs',
  'springs.mixedScale': 'final strength, pairs with a giant',
  'springs.distanceNumerator': 'shorter rest length for bigger hubs',
  'springs.distanceMargin': 'gap added past both radii',
  'charge.exponent': 'size bias of repulsion',
  'charge.scale': 'repulsion strength',
  'charge.base': 'flat repulsion for everyone',
  'charge.rampFloor': 'starting giant push; 1 = static',
  'charge.rampDecay': 'how slowly full push arrives',
  'charge.distanceMin': 'ignore pushes closer than this',
  'charge.distanceMax': 'ignore pushes farther than this',
  'collision.radiusScale': 'personal space vs drawn size',
  'collision.radiusPad': 'flat extra personal space',
  'collision.strength': 'overlap push firmness',
  'collision.iterations': 'resolver passes per tick',
  'collision.alphaGate': 'engage once cooled to this; 1 = always',
  'recall.enabled': 'pull far strays home',
  'recall.start': 'link stretch before recall kicks in',
  'recall.excessDivisor': 'stretch needed to ramp up',
  'recall.rampCap': 'ramp ceiling',
  'recall.rampExponent': 'how sharply pull grows with distance',
  'recall.scale': 'recall strength',
  'recall.alphaFloor': 'keeps working late in the settle',
  'recall.weightDivisor': 'mentions that resist recall',
  'recall.weightFloor': 'minimum recall for giants',
  'hubSeparation.enabled': 'push big hubs apart',
  'hubSeparation.minMentions': 'counts as a hub above this',
  'hubSeparation.crossRange': 'reach across communities',
  'hubSeparation.crossStrength': 'push across communities',
  'hubSeparation.sameRange': 'reach within a community',
  'hubSeparation.sameStrength': 'push within a community',
  'inertia.enabled': 'big mappers resist being moved',
  'inertia.earlyLoss': 'giant damping while hot',
  'inertia.lateLoss': 'giant damping once settled',
  'speedCap.enabled': 'clamp per-tick node speed',
  'speedCap.base': 'speed limit once cool',
  'speedCap.earlyBoost': 'extra headroom while hot',
  'speedCap.maxScale': 'limit multiplier for tiny nodes',
  'speedCap.influenceScale': 'how much size tightens the limit',
  'sim.cooldownTicks': 'ticks until the sim freezes',
  'cleanup.outlierPercentile': 'rim radius percentile',
  'cleanup.outlierSlack': 'allowed distance past the rim',
  'cleanup.maxPasses': 'overlap relaxation passes',
  'cleanup.settleThreshold': 'stop once movement drops below',
};

// Numbers are edited as strings so intermediate states ("0.", "-", "1e")
// don't fight the input; parsing happens once on start
type Draft = Record<string, string | boolean>;

const draftKey = (section: SectionKey, field: string) => `${section}.${field}`;

const buildDraft = (seed: ForcePreset): Draft => {
  const draft: Draft = {};
  for (const section of SECTION_KEYS) {
    for (const [field, value] of Object.entries(seed[section])) {
      draft[draftKey(section, field)] =
        typeof value === 'boolean' ? value : String(value);
    }
  }
  return draft;
};

type Props = {
  // Preset whose values pre-fill the form (the one picked in the list, or
  // the previous custom run when re-opened)
  seed: ForcePreset;
  onStart: (preset: ForcePreset) => void;
  onClose: () => void;
};

const PresetEditor: FC<Props> = ({ seed, onStart, onClose }) => {
  const [draft, setDraft] = useState<Draft>(() => buildDraft(seed));

  const handleStart = () => {
    const built = {
      name: CUSTOM_PRESET_NAME,
      intent: 'Your tuning — adjust values and press start to re-run.',
    } as ForcePreset;
    for (const section of SECTION_KEYS) {
      const out: Record<string, number | boolean> = {};
      for (const [field, seedValue] of Object.entries(seed[section])) {
        const raw = draft[draftKey(section, field)];
        if (typeof seedValue === 'boolean') {
          out[field] = raw === true;
        } else {
          // Unparseable input falls back to the seed value instead of
          // feeding NaN into the simulation
          const parsed = Number(raw);
          out[field] =
            typeof raw === 'string' &&
            raw.trim() !== '' &&
            Number.isFinite(parsed)
              ? parsed
              : (seedValue as number);
        }
      }
      // biome-ignore lint/suspicious/noExplicitAny: assembled section-by-section
      (built as any)[section] = out;
    }
    onStart(built);
  };

  return (
    <aside className={`${styles.labPanel} ${styles.editorPanel}`}>
      <div className={styles.editorHeader}>
        <span className={styles.labTitle}>Custom physics</span>
        <button type="button" className={styles.backButton} onClick={onClose}>
          back
        </button>
      </div>
      <div className={styles.editorFields}>
        {SECTION_KEYS.map((section) => {
          // Sections with an enable flag get the checkbox in their title
          // row; switching it off fades and locks the whole section
          const hasEnabled = 'enabled' in seed[section];
          const enabledKey = draftKey(section, 'enabled');
          const sectionOn = !hasEnabled || draft[enabledKey] === true;
          return (
            <Fragment key={section}>
              <span className={styles.sectionTitle}>
                {section}
                {hasEnabled && (
                  <input
                    type="checkbox"
                    aria-label={`${section} enabled`}
                    title={FIELD_HINTS[enabledKey]}
                    checked={draft[enabledKey] === true}
                    onChange={(event) =>
                      setDraft((previous) => ({
                        ...previous,
                        [enabledKey]: event.target.checked,
                      }))
                    }
                  />
                )}
              </span>
              {Object.entries(seed[section])
                .filter(([field]) => field !== 'enabled')
                .map(([field, seedValue]) => {
                  const key = draftKey(section, field);
                  const value = draft[key];
                  return (
                    <label
                      key={key}
                      htmlFor={key}
                      className={
                        sectionOn
                          ? styles.fieldRow
                          : `${styles.fieldRow} ${styles.fieldRowDisabled}`
                      }
                    >
                      <span className={styles.fieldMain}>
                        <span>{field}</span>
                        {typeof seedValue === 'boolean' ? (
                          <input
                            id={key}
                            type="checkbox"
                            disabled={!sectionOn}
                            checked={value === true}
                            onChange={(event) =>
                              setDraft((previous) => ({
                                ...previous,
                                [key]: event.target.checked,
                              }))
                            }
                          />
                        ) : (
                          <input
                            id={key}
                            type="text"
                            inputMode="decimal"
                            disabled={!sectionOn}
                            value={typeof value === 'string' ? value : ''}
                            onChange={(event) =>
                              setDraft((previous) => ({
                                ...previous,
                                [key]: event.target.value,
                              }))
                            }
                          />
                        )}
                      </span>
                      {FIELD_HINTS[key] && (
                        <span className={styles.fieldHint}>
                          {FIELD_HINTS[key]}
                        </span>
                      )}
                    </label>
                  );
                })}
            </Fragment>
          );
        })}
      </div>
      <button
        type="button"
        className={styles.startButton}
        onClick={handleStart}
      >
        Start
      </button>
    </aside>
  );
};

export default PresetEditor;
