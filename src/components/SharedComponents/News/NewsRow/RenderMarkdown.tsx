import type { FC } from 'react';
import ReactMarkdown from 'react-markdown';

import gfm from 'remark-gfm';

import styles from './style.module.scss';

const RenderMarkdown: FC<{ mdString: string }> = ({ mdString }) => {
  return (
    <ReactMarkdown remarkPlugins={[gfm]} className={styles.markdown}>
      {mdString || 'This update has no description :('}
    </ReactMarkdown>
  );
};
export default RenderMarkdown;
