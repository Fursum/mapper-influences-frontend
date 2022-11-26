import { NextPage } from "next";
import ProfilePage from "@components/PageComponents/ProfilePage";
import { userData } from "@libs/consts/dummyUserData";

const MapperPage: NextPage = () => {
  return (
    <>
      <ProfilePage userData={userData} />
    </>
  );
};

export default MapperPage;
