import { NextPage } from "next";
import { GetServerSideProps } from "next";
import ProfilePage from "@components/PageComponents/ProfilePage";
import { User } from "@libs/types/user";

type Props = {
  userData: User;
};

const MapperPage: NextPage<Props> = ({ userData }) => {
  return (
    <>
      <ProfilePage userData={userData} />
    </>
  );
};

export default MapperPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const userData: User = {
    id: 12345,
    username: "Skytuna",
    avatarUrl: "https://a.ppy.sh/4865030?1650115534.jpeg",
    description: "",
    details: {
      followerCount: 1,
      graveyardCount: 1,
      lovedCount: 0,
      pendingCount: 1,
      rankedCount: 0,
      subCount: 2,
    },
    influences: [
      {
        profileData: {
          avatarUrl: "https://a.ppy.sh/4865030?1650115534.jpeg",
          id: 12345,
          username: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        },
        affection: 50,
        description: "",
        lastUpdated: Date.now(),
      },
    ],
  };

  return {
    props: {
      userData: userData,
    },
  };
};
