import { FC, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { useOnClickOutside } from "usehooks-ts";

import styles from "./style.module.scss";

type Props = {
  fullText: string;
  title: string;
  type: string;
  desc: string;
};
const NewsRow: FC<Props> = ({ fullText, title, type, desc }) => {
  const modalRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  useOnClickOutside(modalRef, () => setShowModal(false));

  const Modal: FC = () => (
    <dialog className={styles.modalBg} open>
      <div className={styles.modal} ref={modalRef}>
        <ReactMarkdown remarkPlugins={[gfm]}>{fullText || ""}</ReactMarkdown>
      </div>
    </dialog>
  );

  return (
    <>
      {showModal && <Modal />}
      <div className={styles.newsRow} onClick={() => setShowModal(true)}>
        <h4>
          {title} <span className={styles.type}>{type}</span>
        </h4>
        <p>{desc}</p>
      </div>
    </>
  );
};

export default NewsRow;
