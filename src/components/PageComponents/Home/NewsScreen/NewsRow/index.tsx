import { FC, useState } from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

import Modal from "@components/SharedComponents/Modal";

import styles from "./style.module.scss";

type Props = {
  fullText: string;
  title: string;
  type: string;
  desc: string;
};
const NewsRow: FC<Props> = ({ fullText, title, type, desc }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {showModal && (
        <Modal showModal={showModal} setShowModal={setShowModal}>
          <ReactMarkdown remarkPlugins={[gfm]}>{fullText || ""}</ReactMarkdown>
        </Modal>
      )}
      <div className={styles.newsRow} onClick={() => setShowModal(true)}>
        <span className={styles.type}>{type}</span>
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
    </>
  );
};

export default NewsRow;
