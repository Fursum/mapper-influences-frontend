import ProfilePage from "@components/PageComponents/ProfilePage";
import useAuth from "@hooks/useAuth";
import { useCurrentUser, useFullUser } from "@hooks/useUser";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const MapperPage: NextPage = () => {
  useAuth();
  const router = useRouter();
  const { mapperId } = router.query;

  const {
    data: fullUser,
    error,
    isLoading,
  } = useFullUser(mapperId?.toString());
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    if (mapperId?.toString() === currentUser?.id.toString())
      router.replace("/profile");
  }, [mapperId, currentUser?.id, router]);

  if (error) return <h1>Error while fetching user: {JSON.stringify(error)}</h1>;
  if (fullUser || isLoading)
    return <ProfilePage userId={mapperId?.toString()} />;
  return <h1>User not found! {error ? JSON.stringify(error) : ""}</h1>;
};

export default MapperPage;
