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

  const { data: fullText, isLoading, isError } = useNewsText(url, showModal);

  return (
    <>
      {showModal && (
        <Modal showModal={showModal} setShowModal={setShowModal}>
          {isError ? (
            <p role="alert">Could not load the update notes.</p>
          ) : isLoading ? (
            <h4 aria-live="polite">Loading...</h4>
          ) : !fullText ? (
            <p>There are no notes for this update.</p>
          ) : (
            <Suspense fallback={<h4 aria-live="polite">Loading...</h4>}>
              <LazyMarkdown mdString={fullText} />
            </Suspense>
          )}
        </Modal>
      )}
      <div
        className={styles.newsRow}
        // biome-ignore lint/a11y/useSemanticElements: a button element cannot contain the heading and paragraph content of the row
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
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
