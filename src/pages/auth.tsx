import { useRouter } from "next/router";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { getUserBase } from "src/services/user";
import { useSessionStore } from "src/states/user";

// This page will handle auth information and set the state and cookies.
const AuthRedirectPage = () => {
  const router = useRouter();
  const [_, setCookie] = useCookies(["session"]);
  const { login } = useSessionStore();

  const session = router.query?.session;

  useEffect(() => {
    if (!session) return;
    setCookie("session", session);
    getUserBase().then((user) => console.log(user));
    //router.replace("/");
  }, [session, setCookie]);

  return <h1>{session}</h1>;
};
export default AuthRedirectPage;
