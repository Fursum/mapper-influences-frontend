import Modal from "@components/SharedComponents/Modal";
import type { NewsType } from "@libs/types/influence";
import { type FC, useState } from "react";
import { type SubmitHandler,useForm } from "react-hook-form";

import NewsRow from "../NewsRow";
import styles from "./style.module.scss";

const CreatePost: FC = ({}) => {
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, watch } = useForm<NewsType>();

  // TODO: Implement service
  const onSubmit: SubmitHandler<NewsType> = (data) => {
    console.log(data);
  };

  return (
    <>
      <Modal showModal={showModal} setShowModal={setShowModal} keepOpen>
        <h2 className={styles.title}>Create Post</h2>
        <NewsRow
          title={watch("title")}
          desc={watch("desc")}
          date={watch("date")}
          fullText={watch("fullText")}
        />
        <button
          className={styles.closePost}
          onClick={() => setShowModal(false)}
        >
          Close
        </button>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <label>
            Post Title:
            <input {...register("title")} />
          </label>
          <label>
            Post Date:
            <input {...register("date")} />
          </label>
          <label>
            Short Description:
            <input {...register("desc")} />
          </label>
          <label>
            Full Post:
            <textarea {...register("fullText")} />
          </label>
          <button>Create</button>
        </form>
      </Modal>
      <button className={styles.createPost} onClick={() => setShowModal(true)}>
        Create Post
      </button>
    </>
  );
};
export default CreatePost;
