import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSessionStore } from "states/user";
import { userData } from "@libs/consts/dummyUserData";

const Oauth: NextPage = ({}) => {
  const router = useRouter();
  const [code, setCode] = useState("");
  const { login } = useSessionStore();

  useEffect(() => {
    if (router.query.code) {
      setCode(router.query.code.toString());
      login(userData, "testAuthKey");
    }
  }, [router.query]);

  return (
    <div>
      <h1>Oauth page</h1>
      <button
        onClick={() => {
          navigator.clipboard
            .writeText(code)
            .then(() => alert("Copied!"))
            .catch(() => alert("Failed to copy."));
        }}
      >
        Copy code
      </button>
      <p style={{ maxWidth: "25rem", wordWrap: "break-word" }}>{code}</p>
    </div>
  );
};

export default Oauth;
