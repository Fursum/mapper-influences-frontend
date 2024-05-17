import type { FC } from 'react';

import { useIsClient, useWindowSize } from 'usehooks-ts';

import styles from './style.module.scss';

const meta = [
  {
    // Culprate - Impulse
    url: 'https://osu.ppy.sh/beatmapsets/705788#osu/1492654',
    video: 'https://fur.s-ul.eu/xSsbXlcy',
    bg: 'https://fur.s-ul.eu/dvPCzLgS',
  },
  {
    // sakuraburst - SELF DESTRUCT
    url: 'https://osu.ppy.sh/beatmapsets/1411188#osu/3844605',
    video: 'https://fur.s-ul.eu/Ewuqs5bu',
    bg: 'https://fur.s-ul.eu/pdxxa4Gy',
  },
  {
    // Chata - enn
    url: 'https://osu.ppy.sh/beatmapsets/406217#osu/882812',
    video: 'https://fur.s-ul.eu/zHBx0ywE',
    bg: 'https://fur.s-ul.eu/7EUKeSiZ',
  },
];

const CoolCards: FC = () => {
  const { width } = useWindowSize();
  const isClient = useIsClient();

  return (
    <div className={styles.positioner}>
      <div className={styles.cardWrapper}>
        {width > 700 &&
          isClient &&
          meta.map((item) => (
            <a
              key={item.url}
              href={item.url}
              target={'_blank'}
              rel="noreferrer"
              className={styles.card}
            >
              <video
                autoPlay
                muted
                loop
                style={{
                  backgroundImage: `url(${item.bg})`,
                }}
              >
                <source src={item.video} type="video/webm" />
                {/* add mp4 fallback later */}
              </video>
              <div className={styles.overlay} />
              <div className={styles.shadow} />
            </a>
          ))}
      </div>
    </div>
  );
};

export default CoolCards;
