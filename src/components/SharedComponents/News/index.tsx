import type { FC } from 'react';

import NewsRow from './NewsRow';

import styles from './style.module.scss';

type Props = { className?: string };
const News: FC<Props> = ({ className }) => {
  return (
    <div className={`${styles.newsContainer} ${className}`}>
      <h2>Latest News</h2>
      {NEWS.map((item, index) => (
        <NewsRow key={index} {...item} />
      ))}
    </div>
  );
};

export default News;

export type NewsType = {
  url: string;
  title: string;
  date: string;
  desc: string;
};

const NEWS: NewsType[] = [
  {
    date: '18 May 2024',
    url: '/patchnotes/1_0.md',
    title: 'Launch!',
    desc: 'That day is finally here!',
  },
];
