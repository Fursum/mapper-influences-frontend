import { type FC, Suspense, lazy, useState } from 'react';

import Modal from '@components/SharedComponents/Modal';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { NewsType } from '..';

import styles from './style.module.scss';

const LazyMarkdown = lazy(() => import('./RenderMarkdown'));

const useNewsText = (url: string, enabled: boolean) =>
  useQuery({
    queryKey: ['news', url],
    queryFn: () => axios.get(url).then((res) => res.data),
    enabled,
  });

const NewsRow: FC<NewsType> = ({ url, title, date, desc }) => {
  const [showModal, setShowModal] = useState(false);

  const { data: fullText } = useNewsText(url, showModal);

  return (
    <>
      {showModal && (
        <Modal showModal={showModal} setShowModal={setShowModal}>
          <Suspense fallback={<h4>Loading...</h4>}>
            <LazyMarkdown mdString={fullText} />
          </Suspense>
        </Modal>
      )}
      <div
        className={styles.newsRow}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setShowModal(true);
          }
        }}
        onClick={() => setShowModal(true)}
      >
        <span className={styles.type}>{date}</span>
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
    </>
  );
};

export default NewsRow;
