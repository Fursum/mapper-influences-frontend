import { NextPage } from "next";
import { GetServerSideProps } from "next";
import ProfilePage from "@components/PageComponents/ProfilePage";
import { User } from "@libs/types/user";
import { InfluenceTypeEnum } from "@libs/types/influence";
import { userData } from "@libs/consts/dummyUserData";

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
  

  return {
    props: {
      userData: userData,
    },
  };
};
