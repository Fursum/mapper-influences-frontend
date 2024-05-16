import ProfilePage from "@components/PageComponents/ProfilePage";
import useAuth from "@hooks/useAuth";
import type { NextPage } from "next";

const MapperPage: NextPage = () => {
  useAuth();

  //if (error) return <h1>Error while fetching user: {error}</h1>;
  //if (loading) return <span>Loading...</span>;
  return <ProfilePage />;
  //return <h1>User not found! {error}</h1>;
};

export default MapperPage;
