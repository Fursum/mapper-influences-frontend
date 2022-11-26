import { NextPage } from "next";
import ProfilePage from "@components/PageComponents/ProfilePage";
import { User } from "@libs/types/user";


const MapperPage: NextPage = () => {
  return (
    <>
      <ProfilePage userData={userData} editable />
    </>
  );
};

export default MapperPage;

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
    maps: [],
    mentions: [],
    username: "Skytuna",
    avatarUrl: "https://a.ppy.sh/4865030?1650115534.jpeg",
  };
