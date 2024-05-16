import { useOsuApi } from "@states/osuApi";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useCurrentUser } from "./useUser";

const REDIRECT_URL = "/";

const useAuth = () => {
  const router = useRouter();
  const { setOsuSdk, resetOsuSdk, osuSdk } = useOsuApi();

  const [cookies, , removeCookie] = useCookies(["access_token"]);

  // Manual logout
  const logout = useCallback(() => {
    removeCookie("access_token");
    resetOsuSdk();
    router.push(REDIRECT_URL);
  }, [removeCookie, router.push, resetOsuSdk]);

  // Kick user to home page if not logged in
  // or redirect to dashboard if logged in
  useEffect(() => {
    if (!cookies.access_token && router.asPath !== REDIRECT_URL) logout();
    else if (router.asPath === REDIRECT_URL && cookies.access_token)
      router.push("/dashboard");
  }, [cookies.access_token, router.asPath, logout, router.push]);

  // Initialize osu sdk
  useEffect(() => {
    if (cookies.access_token && !osuSdk) setOsuSdk(cookies.access_token);
  }, [cookies.access_token, osuSdk, setOsuSdk]);

  return { logout };
};

export default useAuth;
