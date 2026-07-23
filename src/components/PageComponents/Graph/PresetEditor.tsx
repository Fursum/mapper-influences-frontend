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
        {SECTION_KEYS.map((section) => (
          <Fragment key={section}>
            <span className={styles.sectionTitle}>{section}</span>
            {Object.entries(seed[section]).map(([field, seedValue]) => {
              const key = draftKey(section, field);
              const value = draft[key];
              return (
                <label key={key} htmlFor={key} className={styles.fieldRow}>
                  <span>{field}</span>
                  {typeof seedValue === 'boolean' ? (
                    <input
                      id={key}
                      type="checkbox"
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
                      value={typeof value === 'string' ? value : ''}
                      onChange={(event) =>
                        setDraft((previous) => ({
                          ...previous,
                          [key]: event.target.value,
                        }))
                      }
                    />
                  )}
                </label>
              );
            })}
          </Fragment>
        ))}
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
