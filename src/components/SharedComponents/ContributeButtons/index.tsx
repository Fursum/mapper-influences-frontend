import type { FC } from 'react';

import { Discord, Github } from '@components/SvgComponents';

import styles from './style.module.scss';

export const ReportBug: FC = () => {
  return (
    <a
      className={styles.button}
      href={'https://github.com/Fursum/mapper-influences-frontend/issues'}
      target="_blank"
      rel="noreferrer"
    >
      <Github className={styles.icon} color={'var(--buttonText-alt)'} />
    </a>
  );
};

export const SendFeedback: FC = () => {
  return (
    <a
      className={styles.button}
      href={'https://discord.gg/SAwxBDe3Rf'}
      target="_blank"
      rel="noreferrer"
    >
      <Discord className={styles.icon} color={'var(--buttonText-alt)'} />
    </a>
  );
};

const ContributeButtons: FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <h2>Got Feedback?</h2>
      <div className={styles.buttons}>
        <ReportBug />
        <SendFeedback />
      </div>
    </div>
  );
};

export default ContributeButtons;
