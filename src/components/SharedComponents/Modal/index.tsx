import { type FC, type ReactNode, useEffect, useRef } from 'react';

import { useOnClickOutside } from 'usehooks-ts';

import styles from './style.module.scss';

const Modal: FC<{
  className?: string;
  children: ReactNode;
  showModal: boolean;
  setShowModal: (state: boolean) => void;
  keepOpen?: boolean;
}> = ({ className, children, showModal, setShowModal, keepOpen }) => {
  const modalRef = useRef(null);
  useOnClickOutside(modalRef, () => keepOpen || setShowModal(false));

  // Escape closes the modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowModal(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setShowModal]);

  if (!showModal) return null;
  return (
    <dialog className={styles.modalBg} open>
      <div className={`${styles.modal} ${className}`} ref={modalRef}>
        {children}
      </div>
    </dialog>
  );
};

export default Modal;
