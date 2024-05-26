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
    date: '26 May 2024',
    url: '/patchnotes/1_3.md',
    title: 'Update 1.3',
    desc: 'More map search improvements and influence sorting!',
  },
  {
    date: '19 May 2024',
    url: '/patchnotes/1_2.md',
    title: 'Update 1.2',
    desc: 'Map search improvements and mentions!',
  },
  {
    date: '19 May 2024',
    url: '/patchnotes/1_1.md',
    title: 'Update 1.1',
    desc: 'Featured maps on influences!',
  },
  {
    date: '18 May 2024',
    url: '/patchnotes/1_0.md',
    title: 'Launch!',
    desc: 'That day is finally here!',
  },
];
