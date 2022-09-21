import Modal from "@components/SharedComponents/Modal";
import { NewsPost } from "@libs/types/news";
import { FC, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import NewsRow from "../NewsRow";

import styles from "./style.module.scss";

const CreatePost: FC = ({}) => {
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, watch } = useForm<NewsPost>();

  // TODO: Implement service
  const onSubmit: SubmitHandler<NewsPost> = (data) => {
    console.log(data);
  };

  return (
    <>
      <Modal showModal={showModal} setShowModal={setShowModal} keepOpen>
        <h2 className={styles.title}>Create Post</h2>
        <NewsRow
          title={watch("title")}
          desc={watch("shortDesc")}
          type={watch("type")}
          fullText={watch("fullPost")}
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
            Post Type:
            <input {...register("type")} />
          </label>
          <label>
            Short Description:
            <input {...register("shortDesc")} />
          </label>
          <label>
            Full Post:
            <textarea {...register("fullPost")} />
          </label>
          <button>Create</button>
        </form>
      </Modal>
      <button className={styles.createPost} onClick={() => setShowModal(true)}>
        <span>Create Post</span>
      </button>
    </>
  );
};
export default CreatePost;
