import { type FC, type ReactNode, useEffect, useRef, useState } from 'react';

import { useOnClickOutside } from 'usehooks-ts';

import styles from './style.module.scss';

const Modal: FC<{
  className?: string;
  children: ReactNode;
  showModal: boolean;
  setShowModal: (state: boolean) => void;
  keepOpen?: boolean;
}> = ({ className, children, showModal, setShowModal, keepOpen }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const modalRef = useRef(null);
  useOnClickOutside(modalRef, () => keepOpen || setShowModal(false));

  // Kept mounted while the closing animation plays
  const [render, setRender] = useState(showModal);
  useEffect(() => {
    if (showModal) setRender(true);
  }, [showModal]);

  // showModal() gives the focus trap, initial focus, and focus return
  useEffect(() => {
    const dialog = dialogRef.current;
    if (render && dialog && !dialog.open) dialog.showModal();
  }, [render]);

  if (!render) return null;
  return (
    <dialog
      ref={dialogRef}
      className={`${styles.modalBg} ${showModal ? '' : styles.closing}`}
      onCancel={(e) => {
        // Play the closing animation instead of the instant native close
        e.preventDefault();
        setShowModal(false);
      }}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && !showModal) {
          dialogRef.current?.close();
          setRender(false);
        }
      }}
    >
      <div className={`${styles.modal} ${className}`} ref={modalRef}>
        {children}
      </div>
    </dialog>
  );
};

export default Modal;
