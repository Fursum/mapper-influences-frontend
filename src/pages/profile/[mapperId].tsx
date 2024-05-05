import ProfilePage from "@components/PageComponents/ProfilePage";
import { useCurrentUser } from "@hooks/useUser";
import { useFullUser } from "@services/user";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const MapperPage: NextPage = () => {
  const router = useRouter();
  const { mapperId } = router.query;

  const {
    data: fullUser,
    error,
    isLoading,
  } = useFullUser(mapperId?.toString());
  const { user } = useCurrentUser();

  useEffect(() => {
    if (mapperId?.toString() === user?.id.toString()) router.replace("/profile");
  }, [mapperId, user?.id, router]);

  if (error) return <h1>Error while fetching user: {JSON.stringify(error)}</h1>;
  if (fullUser || isLoading)
    return <ProfilePage userId={mapperId?.toString()} />;
  return <h1>User not found! {error ? JSON.stringify(error) : ""}</h1>;
};

export default MapperPage;
