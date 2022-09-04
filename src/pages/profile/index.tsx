import ProfilePage from "@components/PageComponents/ProfilePage";
import { NextPage } from "next";
import { GetServerSideProps } from "next";
import { User } from "@libs/types/user";

type Props = {
  userData: User;
};

const MapperPage: NextPage<Props> = ({ userData }) => {
  return (
    <>
      <ProfilePage userData={userData} editable />
    </>
  );
};

export default MapperPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const userData: User = {
    description: "",
    details: {
      followerCount: 1,
      graveyardCount: 1,
      lovedCount: 0,
      pendingCount: 1,
      rankedCount: 0,
      subCount: 2,
    },
    id: 12345,
    influences: [],
    username: "Skytuna",
    avatarUrl: "https://a.ppy.sh/4865030?1650115534.jpeg",
  };

  return {
    props: {
      userData: userData,
    },
  };
};
