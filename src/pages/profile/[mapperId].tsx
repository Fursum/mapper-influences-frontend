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

  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    if (currentUser && mapperId?.toString() === currentUser?.id.toString())
      router.replace("/profile");
  }, [mapperId, currentUser?.id, router]);

  return <ProfilePage userId={mapperId?.toString()} />;
};

export default MapperPage;
