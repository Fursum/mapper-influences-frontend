import { useBaseUser } from "@services/user";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { useSessionStore } from "src/states/user";

export const useCurrentUser = () => {
  const router = useRouter();
  const { user, login, logout } = useSessionStore();
  const [cookie, _, deleteCookie] = useCookies(["mi-session-token"]);
  const { data, isLoading } = useBaseUser();

  const sessionToken = cookie["mi-session-token"];

  useEffect(() => {
    if (!user && sessionToken && data) login(data);

    if (!sessionToken) {
      logout();
      if (router.pathname !== "/") router.push("/");
    }
  }, [sessionToken, user, login, logout, router, data]);

  return {
    isLoading,
    user,
    logout: () => {
      logout();
      deleteCookie("mi-session-token");
    },
  };
};
