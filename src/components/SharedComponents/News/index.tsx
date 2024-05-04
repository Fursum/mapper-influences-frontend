import { NewsType } from "@libs/types/influence";
import { FC } from "react";

import CreatePost from "./CreatePost";
import NewsRow from "./NewsRow";
import styles from "./style.module.scss";

type Props = { newsList: NewsType[]; className?: string };
const News: FC<Props> = ({ newsList, className }) => {
  const isAdmin = true;
  return (
    <div className={`${styles.newsContainer} ${className}`}>
      <h2>Latest News</h2>
      {isAdmin && <CreatePost />}
      {newsList.map((item, index) => (
        <NewsRow key={index} {...item} />
      ))}
    </div>
  );
};
export default News;
