import { useRouter } from "next/router";
import { useCallback } from "react";
import { useCookies } from "react-cookie";
import { useSessionStore } from "src/states/user";

const REDIRECT_URL = "/";
const useUnauthorized = () => {
  const router = useRouter();
  const { logout } = useSessionStore();
  const [, , removeCookie] = useCookies(["mi-session-token"]);

  const redirect = useCallback(() => {
    removeCookie("mi-session-token");
    logout();
    router.push(REDIRECT_URL);
  }, [logout, removeCookie, router]);

  return { redirect };
};

export default useUnauthorized;
