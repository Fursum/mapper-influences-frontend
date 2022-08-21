import { FC, useMemo } from "react";
import BaseProfileCard from "@components/SharedComponents/BaseProfileCard";
import { userData } from "@libs/consts/dummyUserData";

import styles from "./style.module.scss";
import NewsRow from "./NewsRow";

const exampleMarkdown = "**Test1** *test2* test3 ~~test4~~";
const exampleNews = [
  {
    fullText: exampleMarkdown,
    title: "News Title",
    type: "Update Type",
    desc: "Short description",
  },
];

type NewsType = {
  fullText: string;
  title: string;
  type: string;
  desc: string;
};

type Props = {
  newsList: NewsType[];
};
const NewsScreen: FC<Props> = ({ newsList = exampleNews }) => {
  const exampleTopList = useMemo(
    () =>
      userData.influences
        .map((influence) => ({
          user: influence.profileData,
          number: 50,
        }))
        .sort((a, b) => b.number - a.number),
    []
  );

  return (
    <div className={styles.newsScreen}>
      <div className={styles.topInfluencers}>
        <h2>Top Influencers</h2>
        {exampleTopList.map((rowData) => (
          <div key={rowData.user.id} className={styles.row}>
            <BaseProfileCard userData={rowData.user} />
            <div className={styles.number}>
              {rowData.number}
              <span>{`Mention${rowData.number !== 1 ? "s" : ""}`}</span>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.newsContainer}>
        <h2>Latest News</h2>
        {newsList.map((item, index) => (
          <NewsRow key={index} {...item} />
        ))}
      </div>
    </div>
  );
};
export default NewsScreen;
